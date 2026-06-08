import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { ComponentChildren } from "preact";

interface LayoutProps {
  children: ComponentChildren;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:pl-60 transition-all duration-300">
          <div className="container p-4 md:p-6 mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
