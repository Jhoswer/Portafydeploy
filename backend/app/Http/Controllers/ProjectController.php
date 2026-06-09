<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;
use App\Models\Proyecto;
use App\Support\OfficialSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Proyecto::forUser($request->user()->id)
            ->orderByDesc('id_project')
            ->get();

        return response()->json($projects);
    }

    public function store(ProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['imagen'] = $this->storeImage($request) ?? null;
        $profile = OfficialSchema::ensureProfile($request->user());
        $this->ensureUniqueProjectTitle((int) $profile->getKey(), $data['titulo']);

        $project = DB::transaction(function () use ($data, $profile) {
            $project = Proyecto::create([
                'title' => $data['titulo'],
                'description' => $data['descripcion'] ?? null,
                'repository_url' => $data['url_repositorio'] ?? null,
                'url_demo' => $data['url_demo'] ?? null,
                'image' => $data['imagen'] ?? null,
                'state' => OfficialSchema::databaseProjectState($data['estado'] ?? null),
                'id_profile' => $profile->getKey(),
                'visibility' => true,
            ]);

            $this->syncProjectSkills($project, $data['tecnologias'] ?? null);

            return $project->fresh('skills');
        });

        return response()->json($project, 201);
    }

    public function update(ProjectRequest $request, int $id): JsonResponse
    {
        $project = Proyecto::forUser($request->user()->id)->findOrFail($id);
        $data = $request->validated();
        $this->ensureUniqueProjectTitle((int) $project->id_profile, $data['titulo'], $project->getKey());

        $imagePath = $this->storeImage($request);
        if ($imagePath) {
            $data['imagen'] = $imagePath;
        }

        $project = DB::transaction(function () use ($project, $data) {
            $project->update([
                'title' => $data['titulo'],
                'description' => $data['descripcion'] ?? null,
                'repository_url' => $data['url_repositorio'] ?? null,
                'url_demo' => $data['url_demo'] ?? null,
                'image' => $data['imagen'] ?? $project->getRawOriginal('image'),
                'state' => OfficialSchema::databaseProjectState($data['estado'] ?? $project->estado),
            ]);

            $this->syncProjectSkills($project, $data['tecnologias'] ?? null);

            return $project->fresh('skills');
        });

        return response()->json($project);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $project = Proyecto::forUser($request->user()->id)->findOrFail($id);

        DB::transaction(function () use ($project) {
            $publicationIds = DB::table('PUBLICATION_DETAIL')
                ->where('id_project', $project->getKey())
                ->pluck('id_publication')
                ->filter()
                ->values();

            if ($publicationIds->isNotEmpty()) {
                DB::table('PUBLICATION')
                    ->whereIn('id_publication', $publicationIds)
                    ->update([
                        'visibility' => false,
                        'updated_at' => now(),
                    ]);
            }

            DB::table('PUBLICATION_DETAIL')->where('id_project', $project->getKey())->delete();
            DB::table('CV_DETAIL')->where('id_project', $project->getKey())->delete();
            DB::table('PROJECT_PARTICIPANT')->where('id_project', $project->getKey())->delete();
            DB::table('SAVED')->where('id_project', $project->getKey())->update(['id_project' => null]);
            DB::table('VOUCHER')->where('id_project', $project->getKey())->update(['id_project' => null]);
            DB::table('REPORT')->where('id_project', $project->getKey())->update(['id_project' => null]);
            $project->skills()->detach();
            $project->delete();
        });

        return response()->json(['message' => 'Proyecto eliminado correctamente']);
    }

    private function storeImage(Request $request): ?string
    {
        $file = $request->file('imagen') ?? $request->file('cover');

        return $file ? $file->store('proyectos', 'public') : null;
    }

    private function syncProjectSkills(Proyecto $project, ?string $technologies): void
    {
        $skillIds = collect(OfficialSchema::splitTechnologies($technologies))
            ->map(fn (string $technology) => OfficialSchema::ensureSkill($technology, 'tecnica')->getKey())
            ->values()
            ->all();

        $project->skills()->sync($skillIds);
        $project->load('skills');
    }

    private function ensureUniqueProjectTitle(int $profileId, string $title, ?int $ignoreProjectId = null): void
    {
        $normalizedTitle = mb_strtolower(trim($title));
        $query = Proyecto::query()
            ->where('id_profile', $profileId)
            ->whereRaw('LOWER(TRIM(title)) = ?', [$normalizedTitle]);

        if ($ignoreProjectId) {
            $query->where('id_project', '<>', $ignoreProjectId);
        }

        if (! $query->exists()) {
            return;
        }

        throw ValidationException::withMessages([
            'titulo' => 'Ya tienes un proyecto con ese titulo. Usa un titulo diferente.',
        ]);
    }
}
