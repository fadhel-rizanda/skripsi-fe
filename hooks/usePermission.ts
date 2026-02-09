import {useSession} from "next-auth/react";
import {Permission} from "@/types";
import {useCallback, useMemo} from "react";
import {ADOPTION_PERMISSIONS} from "@/constant/permission";

export function usePermission(){
    const {data: session} = useSession();

    const userPermissions = useMemo(() => {
        return session?.user?.role?.permissions || [];
    }, [session?.user?.role?.permissions]);

    const hasPermission = useCallback((permissionName: string) => {
        return userPermissions.some((p: Permission) => p.name === permissionName);
    }, [userPermissions]);

    return { hasPermission, userPermissions };
}

export function useAdoptionPermission(){
    const {hasPermission} = usePermission();

    return useMemo(() => ({
        canAdopt: hasPermission(ADOPTION_PERMISSIONS.CREATE),
        canViewAdoptions: hasPermission(ADOPTION_PERMISSIONS.VIEW),
    }), [hasPermission]);
}