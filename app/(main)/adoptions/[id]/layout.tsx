import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Adoption Details",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}