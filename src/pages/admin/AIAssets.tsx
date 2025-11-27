import { AdminLayout } from '@/components/admin/AdminLayout';
import { AIAssetManager } from '@/components/AIAssetManager';

const AIAssets = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Asset Generation</h1>
          <p className="text-muted-foreground mt-2">
            Generate and manage premium AI-powered visual assets across the entire platform
          </p>
        </div>

        <AIAssetManager />
      </div>
    </AdminLayout>
  );
};

export default AIAssets;
