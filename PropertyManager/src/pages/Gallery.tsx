import { PropertyGallery } from '../components/welcome/PropertyGallery';

export default function Gallery() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Property Gallery</h1>
        <p className="text-gray-600 mt-1">
          Manage your property photos and images
        </p>
      </div>

      <PropertyGallery allowUpload={true} />
    </div>
  );
}
