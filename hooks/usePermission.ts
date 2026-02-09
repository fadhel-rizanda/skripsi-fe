import {useSession} from "next-auth/react";
import {Permission} from "@/types";

export function usePermission(){
    const {data: session} = useSession();
    const userPermissions = session?.user?.role?.permissions || [];
    const hasPermission = (permissionName: string) => {
        return userPermissions.some((p: Permission) => p.name === permissionName);
    };
    return { hasPermission, userPermissions };
}

export function useAdoptionPermission(){
    const {hasPermission} = usePermission();
    return{
        canAdopt: hasPermission("adopt:create"),
        canViewAdoptions: hasPermission("adopt:view"),
    }
}