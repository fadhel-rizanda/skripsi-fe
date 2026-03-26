import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Pet",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
