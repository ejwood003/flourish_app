import { useQuery } from '@tanstack/react-query';
import { fetchSession } from '@/api/authApi';
import { getUserId, isLoggedIn, setAuth } from '@/lib/auth';

const AUTH_ME_KEY = ['auth', 'me'];

/**
 * Signed-in user id from GET /auth/me (authoritative), with localStorage sync.
 * Fixes stale/missing `userId` in `flourish_auth` while `loggedIn` is still true.
 */
export function useCurrentUserId() {
    const loggedIn = isLoggedIn();

    const { data, isPending, isError } = useQuery({
        queryKey: AUTH_ME_KEY,
        queryFn: async () => {
            const s = await fetchSession();
            if (s) {
                const ut = s.user_type ?? s.userType;
                const uid = s.user_id ?? s.userId;
                if (ut && uid != null && String(uid).trim() !== '') {
                    setAuth(ut, String(uid).trim());
                }
            }
            return s ?? null;
        },
        enabled: loggedIn,
        staleTime: 60_000,
    });

    const raw =
        data?.user_id ??
        data?.userId ??
        getUserId() ??
        null;
    const userId =
        raw != null && String(raw).trim() !== '' ? String(raw).trim() : null;

    return {
        userId,
        /** True while we know you're logged in but haven't resolved an id yet */
        isResolvingUser: loggedIn && isPending && !userId,
        sessionError: loggedIn && isError,
    };
}

export { AUTH_ME_KEY };
