<?php
namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileUploadService
{
    public function upload(
        UploadedFile $file,
        string $directory = 'uploads',
        string $disk = 'public'
    ): string {
        return $file->store($directory, $disk);
    }

    public function delete(
        ?string $path,
        string $disk = 'public'
    ): bool {
        if (!$path) {
            return false;
        }

        return Storage::disk($disk)->delete($path);
    }
}