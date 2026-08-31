import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  KeyRound, 
  Edit3, 
  LogOut, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Globe, 
  Github, 
  Twitter, 
  Facebook, 
  Linkedin,
  Lock, 
  ShieldCheck, 
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  Layers,
  FileText,
  MessageSquare,
  BookOpen,
  Heart,
  Users,
  Eye,
  AtSign
} from 'lucide-react';
import { UserRole } from '../types';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    uploadProfilePhoto,
    removeProfilePhoto,
    logoutUser, 
    setViewMode, 
    setDashboardTab, 
    posts,
    readingList,
    likedPostIds,
    followedAuthorIds,
    language, 
    t, 
    showToast 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safe fallback values
  const safeName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const safeUsername = currentUser?.username || (currentUser?.email ? currentUser.email.split('@')[0].toLowerCase() : 'user');
  const safeEmail = currentUser?.email || 'Email not available';
  const safeAvatar = currentUser?.avatar || currentUser?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeName)}`;
  const safeRole: UserRole = currentUser?.role || 'reader';
  const safeBio = currentUser?.bio || (language === 'bn' ? 'বাংলা কনটেন্ট ক্রিয়েটর ও প্রযুক্তিমনা পাঠক।' : 'Content creator & digital publishing enthusiast.');
  const safeJoinedAt = currentUser?.joinedAt || '2025-01-15';
  const safe2FA = Boolean(currentUser?.twoFactorEnabled);
  const safeWebsite = currentUser?.website || currentUser?.socialLinks?.website || '';

  // Mode and form states
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form input states
  const [formName, setFormName] = useState(safeName);
  const [formUsername, setFormUsername] = useState(safeUsername);
  const [formBio, setFormBio] = useState(safeBio);
  const [formWebsite, setFormWebsite] = useState(safeWebsite);
  const [formTwitter, setFormTwitter] = useState(currentUser?.socialLinks?.twitter || '');
  const [formGithub, setFormGithub] = useState(currentUser?.socialLinks?.github || '');
  const [formFacebook, setFormFacebook] = useState(currentUser?.socialLinks?.facebook || '');
  const [formLinkedin, setFormLinkedin] = useState(currentUser?.socialLinks?.linkedin || '');

  // Photo Upload & Preview State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<{ name: string; sizeFormatted: string; format: string } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCloudUrl, setUploadedCloudUrl] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setFormName(currentUser.name || '');
      setFormUsername(currentUser.username || (currentUser.email ? currentUser.email.split('@')[0] : ''));
      setFormBio(currentUser.bio || '');
      setFormWebsite(currentUser.website || currentUser.socialLinks?.website || '');
      setFormTwitter(currentUser.socialLinks?.twitter || '');
      setFormGithub(currentUser.socialLinks?.github || '');
      setFormFacebook(currentUser.socialLinks?.facebook || '');
      setFormLinkedin(currentUser.socialLinks?.linkedin || '');
    }
  }, [currentUser]);

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Detect format name helper
  const getFormatLabel = (mimeType: string, fileName: string): string => {
    const ext = fileName.split('.').pop()?.toUpperCase() || '';
    if (mimeType.includes('jpeg') || ext === 'JPG' || ext === 'JPEG') return 'JPEG';
    if (mimeType.includes('png') || ext === 'PNG') return 'PNG';
    if (mimeType.includes('webp') || ext === 'WEBP') return 'WEBP';
    return ext || 'JPEG';
  };

  // STEP 1 & 2: Handle Photo selection from native Android Gallery / Device storage
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setUploadSuccessMessage(null);
    setUploadedCloudUrl(null);

    // Strict MIME & Extension Validation (JPEG, JPG, PNG, WEBP only; reject GIF, SVG, PDF, etc.)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isMimeValid = allowedTypes.includes(file.type.toLowerCase()) || Boolean(file.name.match(/\.(jpg|jpeg|png|webp)$/i));

    if (!isMimeValid) {
      const msg = language === 'bn' 
        ? 'এই ছবির ফরম্যাট সমর্থিত নয়। JPEG, PNG অথবা WEBP ছবি নির্বাচন করুন।' 
        : 'Unsupported file format. Please select a JPEG, PNG, or WEBP image.';
      setPhotoError(msg);
      showToast(msg, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Size Validation (10MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const msg = language === 'bn' 
        ? 'ছবির সাইজ ১০ MB-এর বেশি হতে পারবে না।' 
        : 'Image file size exceeds 10MB limit.';
      setPhotoError(msg);
      showToast(msg, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setIsPhotoRemoved(false);
    setFileDetails({
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      format: getFormatLabel(file.type, file.name)
    });

    // Create instant local preview for visual feedback
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Android Gallery / Photos Native File Dialog
  const triggerNativeFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // STEP 3 & 4: Upload Selected Photo to Cloudinary via FormData
  const handleUploadPhotoNow = async () => {
    if (!selectedFile) return;

    setIsUploadingPhoto(true);
    setUploadProgress(0);
    setPhotoError(null);
    setUploadSuccessMessage(null);

    try {
      const res = await uploadProfilePhoto(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success && res.avatarUrl) {
        setUploadedCloudUrl(res.avatarUrl);
        setPhotoPreview(res.avatarUrl);
        setUploadProgress(100);
        const successMsg = language === 'bn' 
          ? 'ছবি সফলভাবে আপলোড হয়েছে' 
          : 'Profile photo uploaded successfully';
        setUploadSuccessMessage(successMsg);
        showToast(successMsg, 'success');
      } else {
        const errorMsg = res.error || (language === 'bn' ? 'ছবি আপলোড করা যায়নি' : 'Photo upload failed');
        setPhotoError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || (language === 'bn' ? 'ছবি আপলোড করা যায়নি' : 'Photo upload failed');
      setPhotoError(errorMsg);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove Photo -> Trigger in-app confirmation modal
  const handleRemovePhoto = () => {
    setShowRemoveConfirmModal(true);
  };

  // Confirmed Remove Photo -> Reset to default avatar
  const handleConfirmRemovePhoto = () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formName || safeName)}`;
    setPhotoPreview(defaultAvatar);
    setSelectedFile(null);
    setFileDetails(null);
    setUploadedCloudUrl(defaultAvatar);
    setUploadSuccessMessage(language === 'bn' ? 'ডিফল্ট ছবি নির্বাচিত হয়েছে' : 'Default avatar selected');
    setIsPhotoRemoved(true);
    setPhotoError(null);
    setShowRemoveConfirmModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(
      language === 'bn' 
        ? 'ডিফল্ট ছবি নির্বাচন করা হয়েছে। পরিবর্তন চূড়ান্ত করতে "পরিবর্তন সংরক্ষণ করুন" চাপুন।' 
        : 'Default avatar selected. Click "Save Changes" to finalize.', 
      'info'
    );
  };

  // STEP 5: Save Entire Profile and Avatar permanently
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast(language === 'bn' ? 'দয়া করে আপনার নাম লিখুন' : 'Please enter your name', 'error');
      return;
    }

    setIsSaving(true);

    try {
      let finalAvatarUrl = safeAvatar;

      // 1. If photo was removed, call backend remove endpoint
      if (isPhotoRemoved) {
        const removeResult = await removeProfilePhoto();
        if (removeResult.success && removeResult.avatarUrl) {
          finalAvatarUrl = removeResult.avatarUrl;
        } else if (!removeResult.success) {
          setIsSaving(false);
          return;
        }
      } 
      // 2. If photo was uploaded to Cloudinary, use permanent HTTPS Cloudinary URL
      else if (uploadedCloudUrl) {
        finalAvatarUrl = uploadedCloudUrl;
      }
      // 3. If file is selected but user clicks Save Changes directly, upload to Cloudinary first
      else if (selectedFile) {
        const uploadResult = await uploadProfilePhoto(selectedFile, (percent) => setUploadProgress(percent));
        if (!uploadResult.success || !uploadResult.avatarUrl) {
          setIsSaving(false);
          return;
        }
        finalAvatarUrl = uploadResult.avatarUrl;
      }

      // 4. Persist updated profile details with permanent Cloudinary URL
      const updateSuccess = await updateUserProfile({
        name: formName.trim(),
        username: formUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        bio: formBio.trim(),
        avatar: finalAvatarUrl,
        avatarUrl: finalAvatarUrl,
        profileImageUrl: finalAvatarUrl,
        website: formWebsite.trim(),
        socialLinks: {
          twitter: formTwitter.trim(),
          github: formGithub.trim(),
          facebook: formFacebook.trim(),
          linkedin: formLinkedin.trim(),
          website: formWebsite.trim()
        }
      });

      if (updateSuccess) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setSelectedFile(null);
        setPhotoPreview(null);
        setFileDetails(null);
        setUploadedCloudUrl(null);
        setUploadSuccessMessage(null);
        setIsPhotoRemoved(false);
        setIsEditing(false);
      } else {
        if (uploadedCloudUrl) {
          showToast(
            language === 'bn' 
              ? 'ছবি ক্লাউডে আপলোড হয়েছে, কিন্তু প্রোফাইলে সংরক্ষণ হয়নি। আবার Save Changes চাপুন।' 
              : 'Photo uploaded to cloud, but failed to save profile. Please click Save Changes again.', 
            'error'
          );
        }
      }
    } catch (err: any) {
      if (uploadedCloudUrl) {
        showToast(
          language === 'bn' 
            ? 'ছবি ক্লাউডে আপলোড হয়েছে, কিন্তু প্রোফাইলে সংরক্ষণ হয়নি। আবার Save Changes চাপুন।' 
            : 'Photo uploaded to cloud, but failed to save profile. Please click Save Changes again.', 
          'error'
        );
      } else {
        showToast(err.message || (language === 'bn' ? 'সংরক্ষণে ত্রুটি হয়েছে' : 'Error saving profile'), 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      showToast(language === 'bn' ? 'বর্তমান পাসওয়ার্ড দিন' : 'Please enter current password', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast(language === 'bn' ? 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showToast(language === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না' : 'New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showToast(language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password updated successfully!');
  };

  const handleToggle2FA = () => {
    updateUserProfile({
      twoFactorEnabled: !safe2FA
    });
    showToast(
      !safe2FA 
        ? (language === 'bn' ? 'টু-ফ্যাক্টর অথেন্টিকেশন (2FA) সক্রিয় করা হয়েছে' : 'Two-Factor Authentication enabled')
        : (language === 'bn' ? 'টু-ফ্যাক্টর অথেন্টিকেশন (2FA) নিষ্ক্রিয় করা হয়েছে' : 'Two-Factor Authentication disabled'),
      'info'
    );
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'editor':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'author':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  // User posts count
  const myPostsCount = posts.filter(p => p.author?.id === currentUser?.id || p.author?.name === currentUser?.name).length;

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-in fade-in">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          <UserIcon className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {language === 'bn' ? 'আপনি লগইন করেননি' : 'You are not logged in'}
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            {language === 'bn' ? 'প্রোফাইল দেখতে অনুগ্রহ করে সাইন-ইন করুন।' : 'Please sign in to view your profile and account settings.'}
          </p>
          <button
            id="btn-return-home"
            onClick={() => setViewMode('reader')}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg"
          >
            {language === 'bn' ? 'হোমে ফিরে যান' : 'Return to Home'}
          </button>
        </div>
      </div>
    );
  }

  const currentDisplayAvatar = photoPreview || safeAvatar;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 sm:pb-20 animate-in fade-in duration-200 space-y-6">
      
      {/* Hidden Native File Input for Android Gallery / Photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="profile-photo-gallery-input"
      />

      {/* Top Header Card */}
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            id="btn-profile-back"
            onClick={() => setViewMode('reader')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোমে ফিরে যান' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-profile-view-blog"
              onClick={() => {
                setViewMode('view-blog');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'bn' ? 'পাবলিক ব্লগ দেখুন' : 'View Public Blog'}</span>
            </button>

            <button
              id="btn-profile-edit-toggle"
              onClick={() => {
                setIsEditing(!isEditing);
                setIsChangingPassword(false);
                setPhotoPreview(null);
                setSelectedFile(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? (language === 'bn' ? 'সম্পাদনা বন্ধ' : 'Cancel') : (language === 'bn' ? 'প্রোফাইল এডিট' : 'Edit Profile')}</span>
            </button>

            <button
              id="btn-profile-logout"
              onClick={() => {
                logoutUser();
                setViewMode('reader');
                showToast(language === 'bn' ? 'লগআউট সফল হয়েছে' : 'Logged out successfully', 'info');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold border border-rose-200 dark:border-rose-900/40 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {/* User Hero Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar with Native Gallery Picker Trigger */}
          <div className="relative group flex-shrink-0">
            <img
              src={currentDisplayAvatar}
              alt={safeName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeName)}`;
              }}
            />
            
            {/* Quick Upload Button on Avatar */}
            <button
              type="button"
              onClick={triggerNativeFilePicker}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/40 border-2 border-white dark:border-slate-900 transition hover:scale-105"
              title={language === 'bn' ? 'গ্যালারি থেকে ছবি আপলোড করুন' : 'Upload photo from phone gallery'}
              aria-label="Upload Photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {safeName}
              </h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase border tracking-wider ${getRoleBadgeStyle(safeRole)}`}>
                {safeRole}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {language === 'bn' ? 'সক্রিয় অ্যাকাউন্ট' : 'Active Account'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <AtSign className="w-3.5 h-3.5 text-indigo-400" />
                <span>{safeUsername}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{safeEmail}</span>
              </span>
              {safeWebsite && (
                <>
                  <span>•</span>
                  <a href={safeWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-500 hover:underline">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{safeWebsite.replace(/^https?:\/\//, '')}</span>
                  </a>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-3 max-w-2xl leading-relaxed">
              {safeBio}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>{myPostsCount} {language === 'bn' ? 'টি পোস্ট' : 'Posts'}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>{readingList.length} {language === 'bn' ? 'টি রিডিং লিস্ট' : 'Saved'}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>{likedPostIds.length} {language === 'bn' ? 'টি লাইক' : 'Likes'}</span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-500" />
                <span>{followedAuthorIds.length} {language === 'bn' ? 'জন অনুসরণকারী' : 'Following'}</span>
              </div>
            </div>

            {/* Social Links List */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-4">
              {currentUser.socialLinks?.website && (
                <a 
                  href={currentUser.socialLinks.website} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                  title="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {currentUser.socialLinks?.github && (
                <a 
                  href={currentUser.socialLinks.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {currentUser.socialLinks?.twitter && (
                <a 
                  href={currentUser.socialLinks.twitter} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {currentUser.socialLinks?.facebook && (
                <a 
                  href={currentUser.socialLinks.facebook} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {currentUser.socialLinks?.linkedin && (
                <a 
                  href={currentUser.socialLinks.linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Photo Upload Form Panel */}
      {isEditing && (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-500" />
              <span>{language === 'bn' ? 'প্রোফাইল ও ছবি পরিবর্তন' : 'Edit Profile & Photo'}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {language === 'bn' ? 'ফোন গ্যালারি থেকে ছবি আপলোড করুন' : 'Upload photo from phone gallery'}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Production-Grade Profile Photo Section */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {language === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Photo'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'bn' 
                      ? 'গ্যালারি বা মেমোরি থেকে পরিষ্কার ছবি নির্বাচন করে আপলোড করুন।' 
                      : 'Choose a clear photo from your gallery or storage, then click Upload.'}
                  </p>
                </div>
                {uploadedCloudUrl && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'bn' ? 'ক্লাউডে আপলোড সম্পন্ন' : 'Uploaded to Cloud'}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-2">
                {/* 100x100 Avatar Preview with Status Overlay */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg bg-slate-200 dark:bg-slate-700">
                    <img
                      src={photoPreview || currentDisplayAvatar}
                      alt={language === 'bn' ? 'প্রোফাইল প্রিভিউ' : 'Profile preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {photoPreview && !uploadedCloudUrl && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white shadow-sm">
                      {language === 'bn' ? 'প্রিভিউ' : 'Preview'}
                    </span>
                  )}
                  {uploadedCloudUrl && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white shadow-sm flex items-center gap-0.5">
                      <Check className="w-3 h-3" />
                      <span>{language === 'bn' ? 'রেডি' : 'Ready'}</span>
                    </span>
                  )}
                </div>

                {/* Upload & File Details Controls */}
                <div className="flex-1 w-full space-y-3">
                  {/* File Metadata Details if selected */}
                  {fileDetails && (
                    <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-xs">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{fileDetails.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                        <span>{fileDetails.sizeFormatted}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold uppercase">{fileDetails.format}</span>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isUploadingPhoto && (
                    <div className="space-y-1.5 animate-in fade-in duration-150">
                      <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{language === 'bn' ? 'ক্লাউড স্টোরেজে আপলোড হচ্ছে...' : 'Uploading to cloud storage...'}</span>
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-200 ease-out" 
                          style={{ width: `${Math.max(5, uploadProgress)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Banner */}
                  {uploadSuccessMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{uploadSuccessMessage}</span>
                    </div>
                  )}

                  {/* Error Banner */}
                  {photoError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{photoError}</span>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {/* Choose / Change from Gallery */}
                    <button
                      type="button"
                      id="btn-choose-from-gallery"
                      aria-label={selectedFile ? (language === 'bn' ? 'অন্য ছবি পরিবর্তন করুন' : 'Change selected photo') : (language === 'bn' ? 'গ্যালারি থেকে ছবি নির্বাচন করুন' : 'Choose photo from gallery')}
                      onClick={triggerNativeFilePicker}
                      disabled={isUploadingPhoto || isSaving}
                      className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-xs transition disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4 text-indigo-500" />
                      <span>
                        {selectedFile 
                          ? (language === 'bn' ? 'অন্য ছবি বাছাই করুন' : 'Choose Different Photo') 
                          : (language === 'bn' ? 'গ্যালারি থেকে ছবি আনুন' : 'Choose from Gallery')}
                      </span>
                    </button>

                    {/* Step 3: Upload Photo Button (Active when file is picked and not yet uploaded) */}
                    {selectedFile && !uploadedCloudUrl && (
                      <button
                        type="button"
                        id="btn-upload-photo-now"
                        aria-label={language === 'bn' ? 'নির্বাচিত ছবি ক্লাউডে আপলোড করুন' : 'Upload chosen photo to cloud'}
                        onClick={handleUploadPhotoNow}
                        disabled={isUploadingPhoto || isSaving}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition animate-in fade-in"
                      >
                        {isUploadingPhoto ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>{language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>{language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo'}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Photo upload success status badge */}
                    {uploadedCloudUrl && (
                      <span className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'bn' ? '✓ ছবি সফলভাবে আপলোড হয়েছে' : '✓ Photo uploaded successfully'}</span>
                      </span>
                    )}

                    {/* Remove Photo Button */}
                    <button
                      type="button"
                      id="btn-remove-avatar"
                      aria-label={language === 'bn' ? 'প্রোফাইল ছবি সরান' : 'Remove profile photo'}
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto || isSaving}
                      className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ছবি সরান' : 'Remove Photo'}</span>
                    </button>
                  </div>

                  {/* Format & Size Guidelines */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    {language === 'bn' 
                      ? 'অনুমোদিত ফরম্যাট: JPEG, PNG, WEBP (সর্বোচ্চ ১০ MB)। ছবি স্বয়ংক্রিয়ভাবে ক্লাউডে অপ্টিমাইজ হবে।' 
                      : 'Allowed formats: JPEG, PNG, WEBP (Max 10MB). Image is securely compressed and optimized in cloud storage.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {language === 'bn' ? 'ইউজারনেম (Username)' : 'Username'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">@</span>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {language === 'bn' ? 'বায়ো / পরিচিতি' : 'Bio / Introduction'}
              </label>
              <textarea
                rows={3}
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                placeholder={language === 'bn' ? 'আপনার সম্পর্কে সংক্ষেপে লিখুন...' : 'Write briefly about yourself...'}
              />
            </div>

            {/* Social and Web Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {language === 'bn' ? 'ওয়েবসাইট ইউআরএল' : 'Website URL'}
                </label>
                <input
                  type="url"
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  placeholder="https://myblog.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  value={formTwitter}
                  onChange={(e) => setFormTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formGithub}
                  onChange={(e) => setFormGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formLinkedin}
                  onChange={(e) => setFormLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                id="btn-cancel-profile-edit"
                onClick={() => {
                  setIsEditing(false);
                  setPhotoPreview(null);
                  setSelectedFile(null);
                }}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="submit"
                id="btn-save-profile"
                disabled={isSaving}
                className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>{language === 'bn' ? '✓ পরিবর্তন সংরক্ষিত' : '✓ Changes Saved'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account Details & Security Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Information Card */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>{language === 'bn' ? 'অ্যাকাউন্ট নিরাপত্তা ও তথ্য' : 'Account Details & Security'}</span>
          </h3>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80">
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-500">{language === 'bn' ? 'ইউজার আইডি' : 'User ID'}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentUser.id}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-500">{language === 'bn' ? 'যোগদানের তারিখ' : 'Member Since'}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {safeJoinedAt}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-500">{language === 'bn' ? 'ভূমিকা (Role)' : 'Role'}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{safeRole}</span>
            </div>

            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-500">{language === 'bn' ? 'টু-ফ্যাক্টর নিরাপত্তা' : '2FA Status'}</span>
              <button
                id="btn-toggle-2fa"
                onClick={handleToggle2FA}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
                  safe2FA
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }`}
              >
                {safe2FA ? (language === 'bn' ? 'সক্রিয় (2FA On)' : 'Enabled') : (language === 'bn' ? 'নিষ্ক্রিয় (2FA Off)' : 'Disabled')}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-toggle-password-form"
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setIsEditing(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>{isChangingPassword ? (language === 'bn' ? 'পাসওয়ার্ড ফর্ম বন্ধ করুন' : 'Close Password Form') : (language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password')}</span>
            </button>
          </div>
        </div>

        {/* Quick Blogger Navigation & Hub Links */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>{language === 'bn' ? 'ব্লগার দ্রুত নেভিগেশন' : 'Blogger Navigation'}</span>
          </h3>

          <div className="space-y-2">
            <button
              id="btn-goto-reading-list"
              onClick={() => {
                setViewMode('dashboard');
                setDashboardTab('reading-list');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{language === 'bn' ? 'রিডিং লিস্ট (Reading List)' : 'Reading List'}</h4>
                  <p className="text-[11px] text-slate-500">{language === 'bn' ? 'সংরক্ষিত পোস্টগুলো পড়ুন' : 'Access your saved blog articles'}</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition">→</span>
            </button>

            <button
              id="btn-goto-posts"
              onClick={() => {
                setViewMode('dashboard');
                setDashboardTab('posts');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{language === 'bn' ? 'পোস্ট সমূহ (Posts)' : 'Posts & Content'}</h4>
                  <p className="text-[11px] text-slate-500">{language === 'bn' ? 'আপনার সমস্ত ব্লগ পোস্ট পরিচালনা করুন' : 'Manage your content and drafts'}</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition">→</span>
            </button>

            <button
              id="btn-goto-comments"
              onClick={() => {
                setViewMode('dashboard');
                setDashboardTab('comments');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{language === 'bn' ? 'মন্তব্য মডারেশন' : 'Comments Moderation'}</h4>
                  <p className="text-[11px] text-slate-500">{language === 'bn' ? 'পাঠকদের মন্তব্য অনুমোদন করুন' : 'Moderate comments on your posts'}</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition">→</span>
            </button>

            <button
              id="btn-goto-followers"
              onClick={() => {
                setViewMode('dashboard');
                setDashboardTab('followers');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{language === 'bn' ? 'ফলোয়ার ও লেখকগণ' : 'Followers & Following'}</h4>
                  <p className="text-[11px] text-slate-500">{language === 'bn' ? 'কমিউনিটি সংযোগ ও অনুসরণ' : 'Manage your connected authors'}</p>
                </div>
              </div>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Form Modal/Accordion */}
      {isChangingPassword && (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <span>{language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন ফর্ম' : 'Change Account Password'}</span>
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'} *
              </label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'} *
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'} *
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg transition"
              >
                {language === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-4 py-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* In-app Remove Profile Photo Confirmation Modal */}
      {showRemoveConfirmModal && (
        <div 
          id="modal-remove-photo-confirm"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'প্রোফাইল ছবি সরাতে চান?' : 'Remove profile photo?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn' 
                  ? 'আপনার বর্তমান ছবি মুছে ডিফল্ট অ্যাভাটার সেট করা হবে। পরিবর্তন স্থায়ী করতে পরবর্তীতে সংরক্ষণ করুন।' 
                  : 'Your current photo will be replaced with a default avatar. Click Save Changes to finalize.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-remove-photo"
                onClick={() => setShowRemoveConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              
              <button
                type="button"
                id="btn-confirm-remove-photo"
                onClick={handleConfirmRemovePhoto}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition"
              >
                {language === 'bn' ? 'হ্যাঁ, সরান' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
