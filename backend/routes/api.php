<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\FormacionAcademicaController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfileAnalyticsController;
use App\Http\Controllers\ProfileEngagementController;
use App\Http\Controllers\ProfileVerificationController;
use App\Http\Controllers\MeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\DefinitionCatalogController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CvImportController;
use App\Http\Controllers\CvController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\PostulationController;
use App\Http\Controllers\AgregarAdminController;
use App\Http\Controllers\HistorialController;
use App\Http\Controllers\VisibilityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CompanyEngagementController;
use App\Http\Controllers\AdminCredentialController;
use App\Http\Controllers\SuspensionController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\AdminProfileTableController;
use App\Http\Controllers\AdminCreacionController;
use App\Http\Controllers\AdminEducationVerificationController;
use App\Http\Controllers\AdminProfileEliminacionTableController;
use App\Http\Controllers\BackupController;
use App\Http\Middleware\SetLogUserContext;
use App\Http\Controllers\CalendarEventController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::get('/user/search', [ProfileController::class, 'search']);
Route::post('/user/search/filters', [ProfileController::class, 'searchWithFilters']);
Route::get('/perfil/public/{usuario}/overview', [ProfileController::class, 'publicOverview']);

Route::get('/feed/posts', [FeedController::class, 'index'])->middleware('auth:sanctum')->withoutMiddleware(['auth']);
Route::get('/feed/trending', [FeedController::class, 'trending'])->middleware('auth:sanctum')->withoutMiddleware(['auth']);

Route::middleware(['auth:sanctum', SetLogUserContext::class])->group(function () {
    Route::post('/formacion', [FormacionAcademicaController::class, 'store']);
    Route::get('/formacion', [FormacionAcademicaController::class, 'index']);
    Route::put('/formacion/{formacion}', [FormacionAcademicaController::class, 'update']);
    Route::delete('/formacion/{formacion}', [FormacionAcademicaController::class, 'destroy']);

    Route::get('/skills', [SkillController::class, 'index']);
    Route::post('/skills', [SkillController::class, 'store']);
    Route::put('/skills/{id}', [SkillController::class, 'update']);
    Route::delete('/skills/{id}', [SkillController::class, 'destroy']);

    Route::get('/experience', [ExperienceController::class, 'index']);
    Route::post('/experience', [ExperienceController::class, 'store']);
    Route::put('/experience/{id}', [ExperienceController::class, 'update']);
    Route::delete('/experience/{id}', [ExperienceController::class, 'destroy']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{id}', [ProjectController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
    Route::post('/projects/{id}/publish', [FeedController::class, 'publishProject']);
    Route::post('/experience/{id}/publish', [FeedController::class, 'publishExperience']);

    Route::get('/feed/me', [FeedController::class, 'mine']);
    Route::get('/feed/saved', [FeedController::class, 'saved']);
    Route::get('/feed/posts/{id}', [FeedController::class, 'show']);
    Route::get('/feed/posts/{id}/comments', [FeedController::class, 'comments']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/motivos', [ReportController::class, 'motivos']);
    Route::post('/reports/publications/{publication}', [ReportController::class, 'storePublication']);
    Route::post('/reports/comments/{comment}', [ReportController::class, 'storeComment']);
    Route::post('/reports/profiles/{usuario}', [ReportController::class, 'storeProfile']);
    Route::post('/reports/{report}/attend', [ReportController::class, 'attend']);
    Route::post('/reports/{report}/reject', [ReportController::class, 'reject']);
    Route::get('/reports/{report}/context', [ReportController::class, 'context']);

    // Sugerencias
    Route::get('/suggestions', [SuggestionController::class, 'index']);
    Route::post('/suggestions', [SuggestionController::class, 'store']);
    Route::post('/suggestions/{suggestion}/accept', [SuggestionController::class, 'accept']);
    Route::post('/suggestions/{suggestion}/reject', [SuggestionController::class, 'reject']);
    Route::post('/suggestions/{suggestion}/discuss', [SuggestionController::class, 'discuss']);
    Route::post('/suggestions/{suggestion}/escalate', [SuggestionController::class, 'escalate']);
    Route::post('/suggestions/{suggestion}/ignore', [SuggestionController::class, 'ignore']);
    Route::get('/suggestions/{suggestion}/context', [SuggestionController::class, 'context']);

    Route::post('/feed/posts/{id}/like', [FeedController::class, 'toggleLike']);
    Route::post('/feed/posts/{id}/save', [FeedController::class, 'toggleSave']);
    Route::post('/feed/posts/{id}/comments', [FeedController::class, 'comment']);
    Route::post('/feed/posts/{id}/unshare', [FeedController::class, 'unshare']);

    Route::get('/socials', [SocialController::class, 'index']);
    Route::post('/socials', [SocialController::class, 'store']);
    Route::put('/socials/{id}', [SocialController::class, 'update']);
    Route::delete('/socials/{id}', [SocialController::class, 'destroy']);

    // Perfil
    Route::get('/perfil/me', [ProfileController::class, 'show']);
    Route::get('/perfil/overview', [ProfileController::class, 'overview']);
    Route::get('/perfil/public/{usuario}/relations', [ProfileEngagementController::class, 'list']);
    Route::get('/perfil/public/{usuario}/follow-status', [ProfileEngagementController::class, 'status']);
    Route::post('/perfil/public/{usuario}/follow', [ProfileEngagementController::class, 'follow']);
    Route::delete('/perfil/public/{usuario}/follow', [ProfileEngagementController::class, 'unfollow']);
    Route::post('/perfil/public/{usuario}/view', [ProfileAnalyticsController::class, 'recordView']);
    Route::get('/perfil/views', [ProfileAnalyticsController::class, 'views']);
    Route::get('/perfil/analytics', [ProfileAnalyticsController::class, 'dashboard']);
    Route::post('/perfil/analytics/events', [ProfileAnalyticsController::class, 'event']);
    Route::get('/perfil/verification', [ProfileVerificationController::class, 'status']);
    Route::post('/perfil/verification', [ProfileVerificationController::class, 'submit']);
    Route::post('/perfil/completar', [ProfileController::class, 'completar']);
    Route::post('/perfil/actualizar', [ProfileController::class, 'storeOrUpdate']);
    Route::post('/perfil/profesional', [ProfileController::class, 'crearPerfilProfesional']);

    // CV
    Route::post('/cv/importar', [CvImportController::class, 'import']);
    Route::get('/cv', [CvController::class, 'index']);
    Route::post('/cv', [CvController::class, 'store']);
    Route::get('/cv/{id}', [CvController::class, 'show']);
    Route::put('/cv/{id}', [CvController::class, 'update']);
    Route::delete('/cv/{id}', [CvController::class, 'destroy']);
    Route::patch('/cv/{id}/visible', [CvController::class, 'toggleVisible']);
    Route::post('/cv/{id}/custom-entry', [CvController::class, 'storeCustomEntry']);
    Route::get('/cv/{id}/custom-entries', [CvController::class, 'getCustomEntries']);
    Route::delete('/cv/{id}/custom-entry/{entryId}', [CvController::class, 'deleteCustomEntry']);
    Route::post('/cv/{id}/upload-pdf', [CvController::class, 'uploadPdf']);

    Route::post('/test-cloudinary', [MeController::class, 'testCloudinary']);

    // Visibilidad
    Route::get('profile/visibility', [VisibilityController::class, 'show']);
    Route::put('profile/visibility', [VisibilityController::class, 'update']);
    
    //Calendario
    Route::post('/calendar/events', [CalendarEventController::class, 'store']);
    Route::get('/calendar/events', [CalendarEventController::class, 'index']);

    // Company
    Route::post('/company', [CompanyController::class, 'store']);
    Route::put('/company', [CompanyController::class, 'update']);

    Route::get('/offers/mine', [OfferController::class, 'mine']);
    Route::get('/offers/stats', [OfferController::class, 'stats']);
    Route::apiResource('offers', OfferController::class);

    Route::post('/postulations', [PostulationController::class, 'store']);
    Route::get('/offers/{id}/postulations', [PostulationController::class, 'index']);
    Route::get('/offers/{id}', [OfferController::class, 'show']);
    Route::patch('/postulations/{id}/state', [PostulationController::class, 'updateState']);
    Route::delete('/postulations/{id}', [PostulationController::class, 'destroy']);
    Route::get('/postulations/my', [PostulationController::class, 'myPostulations']);

    // Admin
    Route::prefix('admin')->group(function () {
        Route::post('users', [AgregarAdminController::class, 'store']);
        Route::get('users/search', [ProfileController::class, 'adminSearchUsers']);
        Route::get('profile/{profile}', [ProfileController::class, 'adminShowProfile']);
        Route::match(['patch', 'post'], 'profile/{profile}', [ProfileController::class, 'adminUpdateProfile']);
        Route::get('credentials/{profile}', [AdminCredentialController::class, 'show']);
        Route::patch('credentials/{profile}', [AdminCredentialController::class, 'update']);
        Route::get('profile/{profile}/tables/{resource}', [AdminProfileTableController::class, 'index']);
        Route::post('profile/{profile}/tables/{resource}/bulk-delete', [AdminProfileTableController::class, 'bulkDelete']);
        Route::post('eliminacion/{profile}/{resource}/bulk-delete', [AdminProfileEliminacionTableController::class, 'bulkDelete']);
        Route::get('eliminacion/{profile}/datos-personales',        [AdminProfileEliminacionTableController::class, 'showDatosPersonales']);
        Route::post('eliminacion/{profile}/datos-personales/delete',[AdminProfileEliminacionTableController::class, 'deleteDatosPersonales']);
        Route::get('profile/{profile}/cv/{cv}', [AdminProfileTableController::class, 'showCv']);
        Route::put('profile/{profile}/cv/{cv}', [AdminProfileTableController::class, 'updateCv']);
        Route::get('profile/{profile}/skill/{skill}', [AdminProfileTableController::class, 'showSkill']);
        Route::put('profile/{profile}/skill/{skill}', [AdminProfileTableController::class, 'updateSkill']);
        Route::get('profile/{profile}/experience/{experience}', [AdminProfileTableController::class, 'showExperience']);
        Route::put('profile/{profile}/experience/{experience}', [AdminProfileTableController::class, 'updateExperience']);
        Route::get('profile/{profile}/offer/{offer}', [AdminProfileTableController::class, 'showOffer']);
        Route::put('profile/{profile}/offer/{offer}', [AdminProfileTableController::class, 'updateOffer']);
        Route::get('profile/{profile}/postulation/{postulation}', [AdminProfileTableController::class, 'showPostulation']);
        Route::put('profile/{profile}/postulation/{postulation}', [AdminProfileTableController::class, 'updatePostulation']);
        Route::get('profile/{profile}/preference/{preference}',  [AdminProfileTableController::class, 'showPreference']);
        Route::put('profile/{profile}/preference/{preference}',  [AdminProfileTableController::class, 'updatePreference']);
        Route::get('profile/{profile}/academico', [AdminProfileTableController::class, 'showAcademico']);
        Route::put('profile/{profile}/academico', [AdminProfileTableController::class, 'updateAcademico']);
        Route::get('profile/{profile}/project/{project}',  [AdminProfileTableController::class, 'showProject']);
        Route::post('profile/{profile}/project/{project}', [AdminProfileTableController::class, 'updateProject']);
        Route::put('profile/{profile}/project/{project}',  [AdminProfileTableController::class, 'updateProject']);
        Route::get('profile/{profile}/publication/{publication}', [AdminProfileTableController::class, 'showPublication']);
        Route::put('profile/{profile}/publication/{publication}', [AdminProfileTableController::class, 'updatePublication']);
        Route::get('profile/{profile}/socials',          [AdminProfileTableController::class, 'showSocials']);
        Route::post('profile/{profile}/socials',         [AdminProfileTableController::class, 'storeSocial']);
        Route::put('profile/{profile}/social/{social}',  [AdminProfileTableController::class, 'updateSocial']);
        Route::delete('profile/{profile}/social/{social}', [AdminProfileTableController::class, 'destroySocial']);
        Route::post('profile/{profile}/cvs',          [AdminCreacionController::class, 'storeCv']);
        Route::post('profile/{profile}/experiences',  [AdminCreacionController::class, 'storeExperience']);
        Route::post('profile/{profile}/skills',       [AdminCreacionController::class, 'storeSkill']);
        Route::post('profile/{profile}/offers',       [AdminCreacionController::class, 'storeOffer']);
        Route::get('offers/available', [AdminCreacionController::class, 'availableOffers']);
        Route::post('profile/{profile}/postulations', [AdminCreacionController::class, 'storePostulation']);
        Route::post('profile/{profile}/projects',     [AdminCreacionController::class, 'storeProject']);
        Route::post('profile/{profile}/publications', [AdminCreacionController::class, 'storePublication']);
        Route::get('historial/usuarios', [HistorialController::class, 'buscarUsuarios']);
        Route::get('historial/usuarios/{id}', [HistorialController::class, 'datosUsuario']);
        Route::get('historial/usuarios/{id}/logs', [HistorialController::class, 'logsUsuario']);
        Route::get('suspension/users', [SuspensionController::class, 'search']);
        Route::post('suspension', [SuspensionController::class, 'store']);
        Route::get('permissions/users', [PermissionController::class, 'search']);
        Route::get('permissions/users/{id}', [PermissionController::class, 'show']);
        Route::put('permissions/users/{id}', [PermissionController::class, 'update']);
        Route::get('backups', [BackupController::class, 'index']);
        Route::post('backups', [BackupController::class, 'store']);
        Route::get('backups/{filename}/download', [BackupController::class, 'download'])->where('filename', '[^/]+');
        Route::post('backups/{filename}/restore', [BackupController::class, 'restore'])->where('filename', '[^/]+');
        Route::delete('backups/{filename}', [BackupController::class, 'destroy'])->where('filename', '[^/]+');
        Route::get('definition/areas', [DefinitionCatalogController::class, 'areas']);
        Route::get('definition/countries', [DefinitionCatalogController::class, 'countries']);
        Route::get('definition/{catalog}', [DefinitionCatalogController::class, 'index']);
        Route::post('definition/{catalog}', [DefinitionCatalogController::class, 'store']);
        Route::get('verifications', [ProfileVerificationController::class, 'adminIndex']);
        Route::get('verifications/{verification}/documents/{document}', [ProfileVerificationController::class, 'document'])->where('document', 'front|back|pdf');
        Route::post('verifications/{verification}/approve', [ProfileVerificationController::class, 'approve']);
        Route::post('verifications/{verification}/reject', [ProfileVerificationController::class, 'reject']);
        Route::get('education-verifications', [AdminEducationVerificationController::class, 'index']);
        Route::get('education-verifications/{formacion}/document', [AdminEducationVerificationController::class, 'document']);
        Route::post('education-verifications/{formacion}/approve', [AdminEducationVerificationController::class, 'approve']);
        Route::post('education-verifications/{formacion}/reject', [AdminEducationVerificationController::class, 'reject']);
    });

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::get('/notification-preferences', [NotificationController::class, 'getPreferences']);
    Route::put('/notification-preferences', [NotificationController::class, 'savePreferences']);
    Route::post('/push-tokens', [NotificationController::class, 'storePushToken']);

    // Company engagement (autenticado)
    Route::get('companies/{company}/follow-status', [CompanyEngagementController::class, 'status']);
    Route::get('companies/{company}/followers', [CompanyEngagementController::class, 'followers']);
    Route::get('companies/{company}/following', [CompanyEngagementController::class, 'following']);
    Route::post('companies/{company}/follow', [CompanyEngagementController::class, 'follow']);
    Route::delete('companies/{company}/follow', [CompanyEngagementController::class, 'unfollow']);
});

// ── Rutas públicas ────────────────────────────────────────────────────────────
Route::get('/company/{id}', [CompanyController::class, 'show']);
Route::get('companies/{company}/public', [CompanyEngagementController::class, 'publicProfile']);
Route::get('/feed/posts', [FeedController::class, 'index']);
Route::post('postulations/{id}/interview', [PostulationController::class, 'storeInterview']);
Route::get('/cv/public/{profileId}', [CvController::class, 'publicIndex']);
