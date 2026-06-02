<?php

namespace App\Support;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class AdminDocumentResponse
{
    public static function inline(string $source, string $filename, ?string $forcedMime = null): Response
    {
        $contents = self::read($source);
        $mime = $forcedMime ?: self::mimeFromSource($source);

        return response($contents, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . addslashes($filename) . '"',
            'Cache-Control' => 'private, max-age=300',
        ]);
    }

    private static function read(string $source): string
    {
        if (preg_match('/^https?:\/\//i', $source)) {
            $response = Http::timeout(15)->get($source);

            if (! $response->successful()) {
                throw new RuntimeException('No se pudo abrir el documento.');
            }

            return $response->body();
        }

        $path = ltrim(preg_replace('/^storage\//', '', preg_replace('/^public\//', '', $source)), '/');

        if (! Storage::disk('public')->exists($path)) {
            throw new RuntimeException('Documento no encontrado.');
        }

        return Storage::disk('public')->get($path);
    }

    private static function mimeFromSource(string $source): string
    {
        $extension = strtolower(pathinfo(parse_url($source, PHP_URL_PATH) ?: $source, PATHINFO_EXTENSION));

        return match ($extension) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };
    }
}
