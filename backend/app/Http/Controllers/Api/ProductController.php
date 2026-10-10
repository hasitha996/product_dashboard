<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexProductRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\FileUploadService;
use Illuminate\Database\QueryException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class ProductController extends Controller
{
    public function __construct(
        private readonly FileUploadService $fileUploadService
    ) {}

    /**
     * GET /api/products
     * Get all products with filtering, sorting and pagination.
     */

    public function index(IndexProductRequest $request)
    {
        try {
            $validated = $request->validated();

            $query = Product::query()->with('category');

            if (!empty($validated['search'])) {
                $query->where(
                    'name',
                    'like',
                    '%' . $validated['search'] . '%'
                );
            }

            if (!empty($validated['category_id'])) {
                $query->where(
                    'category_id',
                    $validated['category_id']
                );
            }

            if (isset($validated['min_price'])) {
                $query->where(
                    'price',
                    '>=',
                    $validated['min_price']
                );
            }

            if (isset($validated['max_price'])) {
                $query->where(
                    'price',
                    '<=',
                    $validated['max_price']
                );
            }

            $products = $query
                ->orderBy(
                    $validated['sort_by'] ?? 'created_at',
                    $validated['sort_dir'] ?? 'desc'
                )
                ->paginate(
                    $validated['per_page'] ?? 10,
                    ['*'],
                    'page',
                    $validated['page'] ?? 1
                )
                ->withQueryString();

            return ProductResource::collection($products)
                ->additional([
                    'pagination' => [
                        'current_page' => $products->currentPage(),
                        'last_page'    => $products->lastPage(),
                        'per_page'     => $products->perPage(),
                        'total'        => $products->total(),
                        'next_page'    => $products->hasMorePages()
                            ? $products->currentPage() + 1
                            : null,
                        'prev_page'    => $products->currentPage() > 1
                            ? $products->currentPage() - 1
                            : null,
                    ],
                ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to retrieve products.',
            ], 500);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    /**
     * POST /api/products
     * Create a new product.
     */
    public function store(StoreProductRequest $request)
    {
        $imagePath = null;

        try {
            $validated = $request->validated();

            if ($request->hasFile('image')) {
                $imagePath = $this->fileUploadService->upload(
                    $request->file('image'),
                    'products',
                    'public'
                );
            }

            $product = DB::transaction(function () use (
                $validated,
                $imagePath
            ) {
                return Product::create([
                    'name'        => $validated['name'],
                    'category_id' => $validated['category_id'],
                    'price'       => $validated['price'],
                    'rating'      => $validated['rating'] ?? 0,
                    'image'       => $imagePath,
                ]);
            });

            return (new ProductResource(
                $product->load('category')
            ))
                ->response()
                ->setStatusCode(201);
        } catch (ValidationException $e) {
            if ($imagePath) {
                $this->fileUploadService->delete($imagePath, 'public');
            }

            throw $e;
        } catch (QueryException $e) {
            if ($imagePath) {
                $this->fileUploadService->delete($imagePath, 'public');
            }

            report($e);

            // A database unique constraint may be violated
            // if two requests create the same name concurrently.
            if (
                str_contains(strtolower($e->getMessage()), 'duplicate entry')
                || str_contains(strtolower($e->getMessage()), 'unique constraint')
                || str_contains(strtolower($e->getMessage()), 'unique violation')
            ) {
                return response()->json([
                    'message' => 'A product with this name already exists.',
                ], 409);
            }

            return response()->json([
                'message' => 'Unable to create the product.',
            ], 500);
        } catch (Throwable $e) {
            if ($imagePath) {
                $this->fileUploadService->delete($imagePath, 'public');
            }

            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred while creating the product.',
            ], 500);
        }
    }

    /**
     * GET /api/products/{product}
     * Get a product by ID.
     */
    public function show($product)
    {
        try {
            $product = Product::with('category')->findOrFail($product);

            return new ProductResource($product);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to retrieve the product.',
            ], 500);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    /**
     * PUT/PATCH /api/products/{product}
     * Update an existing product.
     */
    public function update(
        UpdateProductRequest $request,
        $product
    ) {
        $newImagePath = null;

        try {
            $product = Product::findOrFail($product);
            $validated = $request->validated();
            $oldImagePath = $product->image;

            if ($request->hasFile('image')) {
                $newImagePath = $this->fileUploadService->upload(
                    $request->file('image'),
                    'products',
                    'public'
                );

                $validated['image'] = $newImagePath;
            }

            $product = DB::transaction(function () use (
                $product,
                $validated
            ) {
                $product->update($validated);

                return $product->fresh()->load('category');
            });

            // Delete the old image only after a successful DB update.
            if (
                array_key_exists('image', $validated)
                && $oldImagePath
                && $oldImagePath !== $product->image
            ) {
                $this->fileUploadService->delete(
                    $oldImagePath,
                    'public'
                );
            }

            return response()->json([
                'message' => 'Product updated successfully.',
                'data'    => new ProductResource($product),
            ], 200);
        } catch (ModelNotFoundException $e) {
            if ($newImagePath) {
                $this->fileUploadService->delete($newImagePath, 'public');
            }

            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        } catch (ValidationException $e) {
            if ($newImagePath) {
                $this->fileUploadService->delete($newImagePath, 'public');
            }

            throw $e;
        } catch (QueryException $e) {
            if ($newImagePath) {
                $this->fileUploadService->delete($newImagePath, 'public');
            }

            report($e);

            if (
                str_contains(strtolower($e->getMessage()), 'duplicate entry')
                || str_contains(strtolower($e->getMessage()), 'unique constraint')
                || str_contains(strtolower($e->getMessage()), 'unique violation')
            ) {
                return response()->json([
                    'message' => 'A product with this name already exists.',
                ], 409);
            }

            return response()->json([
                'message' => 'Unable to update the product.',
            ], 500);
        } catch (Throwable $e) {
            if ($newImagePath) {
                $this->fileUploadService->delete($newImagePath, 'public');
            }

            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred while updating the product.',
            ], 500);
        }
    }

    /**
     * DELETE /api/products/{product}
     * Delete a product.
     */
    public function destroy($product)
    {
        try {
            $product = Product::findOrFail($product);
            $imagePath = $product->image;

            DB::transaction(function () use ($product) {
                $product->delete();
            });

            if ($imagePath) {
                $this->fileUploadService->delete(
                    $imagePath,
                    'public'
                );
            }

            return response()->json([
                'message' => 'Product deleted successfully.',
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Product not found.',
            ], 404);
        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to delete the product.',
            ], 500);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred while deleting the product.',
            ], 500);
        }
    }
}
