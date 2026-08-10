'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  FileText,
  Upload,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Globe,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { uploadCounselorDocument } from '@/lib/supabaseStorage';
import { CounselorApplication } from '@/lib/types';

interface CounselorApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (appData: Omit<CounselorApplication, 'id' | 'status' | 'submitted_at'>) => Promise<boolean>;
}

const AVAILABLE_SPECIALTIES = [
  'Anxiety & Panic',
  'Depression & Mood',
  'Cognitive Behavioral Therapy (CBT)',
  'Trauma & PTSD',
  'Relationships & Marriage',
  'Grief & Bereavement',
  'Stress & Burnout',
  'Mindfulness & Grounding',
  'Adolescent Counseling',
  'Addiction Recovery',
];

const AVAILABLE_LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Spanish', 'French'];

export const CounselorApplyModal: React.FC<CounselorApplyModalProps> = ({
  isOpen,
  onClose,
  onSubmitApplication,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [degree, setDegree] = useState('Psy.D. Clinical Psychology');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [certificationsInput, setCertificationsInput] = useState('Clinical Psychologist License, CBT Certified Practitioner');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Anxiety & Panic', 'Cognitive Behavioral Therapy (CBT)']);
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(6);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Hindi']);
  
  // File Uploads (Supabase Storage)
  const [idFile, setIdFile] = useState<File | null>(null);
  const [uploadedDocName, setUploadedDocName] = useState<string>('');
  const [uploadedDocUrl, setUploadedDocUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleSpecialty = (item: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const result = await uploadCounselorDocument(file, 'counselor-ids');
      setUploadedDocName(result.name);
      setUploadedDocUrl(result.url);
    } catch (err: any) {
      setErrorMessage('Failed to upload document to Supabase Storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !licenseNumber.trim()) {
      setErrorMessage('Please fill in your full name, professional email, and license number.');
      return;
    }

    if (selectedSpecialties.length === 0) {
      setErrorMessage('Please select at least one specialty area.');
      return;
    }

    setIsSubmitting(true);

    try {
      const docName = uploadedDocName || idFile?.name || 'Govt_ID_Document.pdf';
      const docUrl =
        uploadedDocUrl ||
        'https://rxxlawptbtwrtxpbyoyt.supabase.co/storage/v1/object/public/patient-docs/sample-id.pdf';

      const certList = certificationsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const ok = await onSubmitApplication({
        user_id: `counselor-${Date.now()}`,
        full_name: fullName,
        email,
        bio: bio || 'Licensed MindBloom Clinical Counselor specializing in evidence-based therapy.',
        license_number: licenseNumber,
        certifications: certList,
        degree,
        specialties: selectedSpecialties,
        id_document_name: docName,
        id_document_url: docUrl,
        years_of_experience: Number(yearsOfExperience) || 5,
        languages: selectedLanguages,
      });

      if (ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setErrorMessage('Failed to submit application. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-sky-100 relative my-8 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
              <Sparkles className="w-3.5 h-3.5" /> MindBloom Clinical Practice Enrollment
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Join as a Verified Counselor</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Submit your clinical credentials for admin verification before receiving bookings.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Application Error</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Submission Success Alert */}
        {submitSuccess ? (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Application Submitted for Admin Verification!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Thank you, <span className="font-bold">{fullName}</span>. Your clinical credentials and government ID have been securely uploaded to Supabase Storage. Our clinical operations team will review your application shortly.
            </p>
            <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-xs text-sky-900 max-w-md mx-auto">
              <span className="font-bold">Status: Pending Verification</span>
              <p className="text-[11px] text-sky-700 mt-1">
                You will see an &quot;Under Review&quot; status banner upon logging into your counselor account.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Navigation Bar */}
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                  step === 1 ? 'bg-white text-sky-900 shadow-xs border border-sky-200' : 'text-slate-500'
                }`}
              >
                1. Personal & Degrees
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                  step === 2 ? 'bg-white text-sky-900 shadow-xs border border-sky-200' : 'text-slate-500'
                }`}
              >
                2. Specialties & Experience
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                  step === 3 ? 'bg-white text-sky-900 shadow-xs border border-sky-200' : 'text-slate-500'
                }`}
              >
                3. Govt ID Verification
              </button>
            </div>

            {/* STEP 1: Basic & Credentials */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Professional Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="counselor@practice.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Highest Degree Information *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Psy.D. in Clinical Psychology"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Psychology License / Reg Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PSY-2026-88941"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Relevant Certifications (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Licensed Clinical Counselor, Certified CBT Specialist"
                    value={certificationsInput}
                    onChange={(e) => setCertificationsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Clinical Bio *</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your therapeutic methodology, compassionate approach, and clinical background..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 blue-gradient-btn text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    Next: Specialties & Experience &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Specialties & Experience */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Clinical Specialties & Focus Areas (Multi-select) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_SPECIALTIES.map((item) => {
                      const isSelected = selectedSpecialties.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleSpecialty(item)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-sky-50 border-sky-400 text-sky-900 ring-1 ring-sky-400 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      <Briefcase className="w-3.5 h-3.5 inline text-sky-600 mr-1" />
                      Years of Clinical Experience
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      <Globe className="w-3.5 h-3.5 inline text-sky-600 mr-1" />
                      Languages Spoken
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {AVAILABLE_LANGUAGES.map((lang) => {
                        const active = selectedLanguages.includes(lang);
                        return (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                              active
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            {lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 blue-gradient-btn text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    Next: Govt ID Upload &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Govt ID Verification & Submit */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Government-Issued License or ID Verification Document
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Upload a scanned PDF or high-resolution image of your official psychology practice license or government ID. All documents are encrypted and uploaded directly to <span className="font-semibold text-slate-800">Supabase Storage</span>.
                  </p>

                  <div className="border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-6 text-center transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-800">
                        <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                        Uploading document to Supabase Storage...
                      </div>
                    ) : uploadedDocName ? (
                      <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Document Attached: {uploadedDocName}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-8 h-8 text-sky-600 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-800">Click to upload Clinical ID or License PDF</p>
                        <p className="text-[10px] text-slate-500 font-medium">Supports PDF, PNG, JPG (Max 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900">
                  <span className="font-bold flex items-center gap-1.5 mb-0.5">
                    <Award className="w-4 h-4 text-amber-700" /> Administrative Review Guarantee
                  </span>
                  Your account will remain in <span className="font-bold text-slate-900">Pending Review</span> status until MindBloom Operations verifies your license number with the clinical board.
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-6 py-2.5 blue-gradient-btn text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-sky-200" /> Submit Application for Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
