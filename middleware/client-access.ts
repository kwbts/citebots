// Middleware to restrict client user access to admin-only pages
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware if not authenticated
  if (!useSupabaseUser().value) {
    return navigateTo('/');
  }

  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Check if user is a client (by either role or account_type)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_type')
    .eq('id', user.value?.id)
    .single();

  const isClient = profile?.role === 'client' || profile?.account_type === 'client';

  // If user is client and trying to access a restricted path, redirect to dashboard
  if (isClient) {
    const restrictedPaths = [
      '/dashboard/analysis',
      '/dashboard/clients',
      '/dashboard/admin'
    ];

    // Check if the current route starts with any restricted path
    const isRestricted = restrictedPaths.some(path => 
      to.path === path || to.path.startsWith(`${path}/`)
    );

    if (isRestricted) {
      console.log('Client user attempted to access restricted path:', to.path);
      return navigateTo('/dashboard');
    }
  }
});