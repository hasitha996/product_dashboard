<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Database\QueryException;
use Throwable;

class CategoryController extends Controller
{
    /**
     * GET /api/categories
     * Get all categories.
     */
    public function index()
    {
        try {
            $categories = Category::query()
                ->orderBy('name')
                ->get();

            return CategoryResource::collection($categories);

        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to retrieve categories.',
            ], 500);

        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }

    /**
     * GET /api/categories/{id}
     * Get a single category.
     */
    public function show(string $id)
    {
        try {
            $category = Category::findOrFail($id);

            return new CategoryResource($category);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Category not found.',
            ], 404);

        } catch (QueryException $e) {
            report($e);

            return response()->json([
                'message' => 'Unable to retrieve category.',
            ], 500);

        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'An unexpected error occurred.',
            ], 500);
        }
    }
}