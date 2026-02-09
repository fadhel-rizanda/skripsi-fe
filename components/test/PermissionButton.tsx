'use client';

import {Button} from "@/components/ui/button";
import {useAdoptionPermission} from "@/hooks/usePermission";

export default function PermissionButton (){
    const { canAdopt } = useAdoptionPermission();

    return <>
        <Button disabled={!canAdopt} onClick={() => alert("You have permission!")} className="mb-4">
            Has permission
        </Button>
    </>
}