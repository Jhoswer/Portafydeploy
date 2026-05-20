<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Profile;
use App\Services\ProfileEngagementService;
use App\Support\OfficialSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyEngagementController extends Controller
{
    public function __construct(private readonly ProfileEngagementService $engagementService) {}

    // GET /companies/{company}/follow-status
    public function status(Request $request, Company $company): JsonResponse
    {
        try {
            $companyProfile = Profile::where('id_company', $company->id_company)->firstOrFail();
            $viewer = $request->user() ? OfficialSchema::ensureProfile($request->user()) : null;

            return response()->json($this->engagementService->summary($companyProfile, $viewer));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // POST /companies/{company}/follow
    public function follow(Request $request, Company $company): JsonResponse
    {
        try {
            $companyProfile = Profile::where('id_company', $company->id_company)->firstOrFail();
            $companyUser    = $companyProfile->userRole->user;

            return response()->json(
                $this->engagementService->follow($request->user(), $companyUser),
                201
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // DELETE /companies/{company}/follow
    public function unfollow(Request $request, Company $company): JsonResponse
    {
        try {
            $companyProfile = Profile::where('id_company', $company->id_company)->firstOrFail();
            $companyUser    = $companyProfile->userRole->user;

            return response()->json(
                $this->engagementService->unfollow($request->user(), $companyUser)
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // GET /companies/{company}/followers
    public function followers(Request $request, Company $company): JsonResponse
    {
        try {
            $companyProfile = Profile::where('id_company', $company->id_company)->firstOrFail();
            $viewer = $request->user() ? OfficialSchema::ensureProfile($request->user()) : null;

            return response()->json(
                $this->engagementService->list($companyProfile, 'followers', $viewer)
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
    public function following(Request $request, Company $company): JsonResponse
    {
        try {
            $companyProfile = Profile::where('id_company', $company->id_company)->firstOrFail();
            $viewer = $request->user() ? OfficialSchema::ensureProfile($request->user()) : null;

            return response()->json(
                $this->engagementService->list($companyProfile, 'following', $viewer)
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function publicProfile(Request $request, Company $company): JsonResponse
    {
        $companyProfile = Profile::where('id_company', $company->id_company)->firstOrFail();
        $viewer = $request->user() ? OfficialSchema::ensureProfile($request->user()) : null;
        $summary = $this->engagementService->summary($companyProfile, $viewer);

        // Ofertas públicas de la empresa
        $offers = \App\Models\Offer::with('skills')
            ->where('id_profile', $companyProfile->id_profile)
            ->whereIn('state', ['open', 'visible'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'company'  => $company,
            'metrics'  => $summary,
            'offers'   => $offers,
        ]);
    }
}
