import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminFooter } from "./AdminFooter";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
          
          <AdminFooter />
        </div>
      </div>
    </SidebarProvider>
  );
};
