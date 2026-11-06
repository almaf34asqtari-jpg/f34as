import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Phone,
  Camera,
  AlertCircle,
} from 'lucide-react';
import {
  Listing,
  CategoryId,
  UserProfile,
  PropertySpecs,
  CarSpecs,
  GamingSpecs,
} from '../types/marketplace';
import { getStoredListings, saveListings, getStoredNotifications, saveNotifications } from '../utils/storage';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAdCreated: (newListing: Listing) => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAdCreated,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<CategoryId>('gaming');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [city, setCity] = useState<'Muscat' | 'Salalah' | 'Sohar' | 'Nizwa' | 'Seeb' | 'Bawshar' | 'Sur' | 'Al Buraimi'>('Muscat');
  const [location, setLocation] = useState('Al Khoudh, Seeb');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '+968 9123 4567');
  const [description, setDescription] = useState('');
  
  // Real user uploaded photos (Data URLs) - Zero AI generated presets
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Gaming specs
  const [consoleModel, setConsoleModel] = useState<GamingSpecs['consoleModel']>('PlayStation 5 Slim');
  const [gamingStorage, setGamingStorage] = useState<GamingSpecs['storage']>('1TB');
  const [gamingCondition, setGamingCondition] = useState<GamingSpecs['condition']>('Like New (Open Box)');
  const [includedGames, setIncludedGames] = useState('EA Sports FC 25, Spider-Man 2');

  // Place specs
  const [propertyType, setPropertyType] = useState<PropertySpecs['propertyType']>('Villa');
  const [bedrooms, setBedrooms] = useState('4');
  const [bathrooms, setBathrooms] = useState('5');
  const [areaSqM, setAreaSqM] = useState('450');
  const [listingType, setListingType] = useState<PropertySpecs['listingType']>('For Sale');
  const [furnished, setFurnished] = useState(true);

  // Car specs
  const [carMake, setCarMake] = useState('Toyota');
  const [carModel, setCarModel] = useState('Land Cruiser');
  const [carYear, setCarYear] = useState('2024');
  const [carMileage, setCarMileage] = useState('24000');
  const [specsOrigin, setSpecsOrigin] = useState<CarSpecs['specsOrigin']>('GCC Specs');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Handle local file photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate image type
      if (!file.type.startsWith('image/')) {
        setError('Please select valid image files only (PNG, JPG, JPEG, WEBP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setUploadedImages((prev) => [...prev, result]);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (!customImageUrl.trim()) return;
    if (!customImageUrl.startsWith('http://') && !customImageUrl.startsWith('https://')) {
      setError('Please provide a valid image URL starting with https://');
      return;
    }
    setUploadedImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
    setError(null);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      setError('Please provide a listing title and price in OMR.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please provide a valid price in OMR.');
      return;
    }

    if (!sellerPhone.trim()) {
      setError('Please provide your phone number so buyers can reach you.');
      return;
    }

    if (!location.trim()) {
      setError('Please provide the physical handover location or neighborhood.');
      return;
    }

    // Ensure seller uploaded at least one genuine photo
    if (uploadedImages.length === 0) {
      setError('Please upload at least one real photo of your item (no AI or blank posts allowed).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const newListing: Listing = {
      id: `item-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `${title} in excellent condition. Available for in-person cash handover or Venmo in ${city}, Oman.`,
      category,
      price: priceNum,
      originalPrice: isNegotiable ? Math.round(priceNum * 1.15) : undefined,
      currency: 'OMR',
      isNegotiable,
      location: location.trim(),
      city,
      images: uploadedImages,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerPhone: sellerPhone.trim(),
      sellerAvatar: currentUser.avatar,
      sellerRating: currentUser.rating || 5.0,
      sellerReviewCount: currentUser.reviewCount || 0,
      sellerVerified: true,
      status: 'active',
      views: 1,
      saves: 0,
      createdAt: new Date().toISOString(),
    };

    if (category === 'gaming') {
      newListing.gamingSpecs = {
        consoleModel,
        storage: gamingStorage,
        condition: gamingCondition,
        includedGames: includedGames.split(',').map((g) => g.trim()).filter(Boolean),
        includedAccessories: ['Original Controller', 'HDMI 2.1 Cable', 'Power Cord'],
        warrantyMonths: 12,
      };
    } else if (category === 'places') {
      newListing.propertySpecs = {
        propertyType,
        bedrooms: parseInt(bedrooms) || 3,
        bathrooms: parseInt(bathrooms) || 3,
        areaSqM: parseInt(areaSqM) || 200,
        listingType,
        furnished,
        amenities: ['Covered Parking', 'Balcony', 'Air Conditioning'],
      };
    } else if (category === 'cars') {
      newListing.carSpecs = {
        make: carMake,
        model: carModel,
        year: parseInt(carYear) || 2024,
        mileageKm: parseInt(carMileage) || 10000,
        transmission: 'Automatic',
        specsOrigin,
        fuelType: 'Petrol',
        bodyType: 'SUV',
        condition: 'Excellent (Single Owner)',
      };
    }

    // Save locally
    const currentListings = getStoredListings();
    const updated = [newListing, ...currentListings];
    saveListings(updated);

    // Notify user
    const notifs = getStoredNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Ad Published Successfully! 🎉',
      body: `Your listing "${newListing.title}" is live for buyers across Oman to inspect and negotiate.`,
      type: 'discount_request',
      relatedListingId: newListing.id,
      read: false,
      createdAt: 'Just now',
    });
    saveNotifications(notifs);

    setTimeout(() => {
      setIsSubmitting(false);
      onAdCreated(newListing);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e1e20] text-zinc-100 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#e0f252] text-[#111113] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-oswald text-lg sm:text-xl font-bold text-white uppercase tracking-wider">
                  Post Free Listing
                </h2>
                <span className="bg-[#e0f252]/20 text-[#e0f252] text-[10px] font-bold px-2 py-0.5 rounded font-mono-tech uppercase">
                  100% Free
                </span>
              </div>
              <p className="text-[11px] font-mono-tech text-zinc-400">
                Sell Places, Cars, PlayStation Consoles, Games & Tech across Oman
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-mono-tech uppercase text-zinc-300 mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'gaming', label: 'PlayStation / Gaming', emoji: '🎮' },
                  { id: 'places', label: 'Places / Real Estate', emoji: '🏡' },
                  { id: 'cars', label: 'Cars & Vehicles', emoji: '🚗' },
                  { id: 'electronics', label: 'Tech & Mobiles', emoji: '📱' },
                  { id: 'furniture', label: 'Home & Living', emoji: '🛋️' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    category === cat.id
                      ? 'bg-[#e0f252] border-[#e0f252] text-[#111113] font-bold shadow-sm'
                      : 'bg-[#161618] border-white/10 hover:border-white/20 text-zinc-300'
                  }`}
                >
                  <span className="block text-lg mb-1">{cat.emoji}</span>
                  <span className="block text-[11px] font-mono-tech leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* REAL USER PHOTO UPLOADER (NO AI GENERATED PHOTOS) */}
          <div className="p-4 rounded-xl bg-[#161618] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-mono-tech uppercase text-white font-bold flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#e0f252]" />
                  <span>Upload Real Photos of Item (No AI Content)</span>
                </label>
                <p className="text-[10px] text-zinc-400 font-mono-tech">
                  Upload genuine photos from your phone or device so buyers can inspect reality.
                </p>
              </div>
              <span className="text-[10px] font-mono-tech text-[#e0f252] bg-[#e0f252]/10 px-2 py-0.5 rounded">
                {uploadedImages.length} uploaded
              </span>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Photo Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative aspect-4/3 rounded-lg overflow-hidden border border-white/20 group">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/70 text-[#e0f252] text-[9px] font-mono-tech px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Drop Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-4/3 rounded-lg border-2 border-dashed border-white/20 hover:border-[#e0f252] hover:bg-[#e0f252]/5 text-zinc-400 hover:text-[#e0f252] flex flex-col items-center justify-center gap-1 transition-all"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[11px] font-mono-tech uppercase font-bold">Choose Photos</span>
                <span className="text-[9px] text-zinc-500 font-mono-tech">PNG, JPG, WEBP</span>
              </button>
            </div>

            {/* URL input fallback */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste direct image URL (https://...)"
                className="flex-1 px-3 py-1.5 bg-[#1e1e20] border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 outline-none focus:border-[#e0f252]"
              />
              <button
                type="button"
                onClick={handleAddUrlImage}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono-tech uppercase font-bold transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono-tech uppercase text-zinc-300 mb-1.5">
                Ad Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PlayStation 5 Slim 1TB with 2 Controllers & FC 25"
                className="w-full px-3.5 py-2.5 bg-[#161618] border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-[#e0f252] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech uppercase text-zinc-300 mb-1.5">
                Price (OMR)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-mono-tech text-zinc-400">OMR</span>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="180"
                  className="w-full pl-12 pr-3 py-2.5 bg-[#161618] border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 font-mono-tech outline-none focus:border-[#e0f252]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Negotiable Toggle */}
          <div className="p-3 bg-[#161618] rounded-xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isNegotiable"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 rounded text-[#e0f252] accent-[#e0f252] cursor-pointer"
              />
              <label htmlFor="isNegotiable" className="text-xs font-mono-tech text-zinc-300 cursor-pointer">
                Enable Direct Price Negotiation ("Ask Discount" button active for buyers)
              </label>
            </div>
            <span className="text-[10px] font-mono-tech text-[#e0f252]">Cash / Venmo deals</span>
          </div>

          {/* REQUIRED SELLER PHONE & LOCATION (Buyer can see it) */}
          <div className="p-4 rounded-xl bg-[#161618] border border-white/10 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono-tech font-bold text-white uppercase">
              <MapPin className="w-4 h-4 text-[#e0f252]" />
              <span>Seller Contact & Handover Spot (Visible to Buyers)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono-tech text-zinc-400 mb-1 uppercase">
                  Seller Phone (+968) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="+968 9123 4567"
                    className="w-full pl-9 pr-3 py-2 bg-[#1e1e20] border border-white/15 rounded-lg text-xs text-white placeholder-zinc-500 font-mono-tech outline-none focus:border-[#e0f252]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-tech text-zinc-400 mb-1 uppercase">
                  Governorate / City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#1e1e20] border border-white/15 rounded-lg text-xs text-white outline-none focus:border-[#e0f252]"
                >
                  {['Muscat', 'Seeb', 'Bawshar', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Al Buraimi'].map((c) => (
                    <option key={c} value={c} className="bg-[#1e1e20] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono-tech text-zinc-400 mb-1 uppercase">
                Specific Neighborhood & Handover Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Al Mouj Marina, Street 14, Muscat or Al Khoudh 6th, Seeb"
                className="w-full px-3 py-2 bg-[#1e1e20] border border-white/15 rounded-lg text-xs text-white placeholder-zinc-500 outline-none focus:border-[#e0f252]"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono-tech uppercase text-zinc-300 mb-1.5">
              Description & Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe real condition, included accessories, warranty, in-person cash inspection terms..."
              className="w-full px-3.5 py-2.5 bg-[#161618] border border-white/15 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-[#e0f252] transition-colors resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-mono-tech text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#e0f252] hover:bg-[#cbdb40] text-[#111113] font-oswald uppercase tracking-wider text-sm font-bold rounded-lg shadow-lg shadow-[#e0f252]/10 active:scale-95 transition-all"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Free Listing Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
