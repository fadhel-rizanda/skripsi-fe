"use client";

import {CommunityPageLayout} from "../layout";
import CommunityFormDialog from "@/components/dialog/CommunityFormDialog";

export default function AllCommunityPage() {
    return (
        <>
            <CommunityPageLayout>
                Filter
                <div className="flex justify-end pt-6 w-full max-w-3xl">
                    <CommunityFormDialog mode="create"/>
                </div>
            </CommunityPageLayout>
        </>
    );
}
