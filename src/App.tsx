/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BriefcaseBusiness, Briefcase, UserSearch, Search, User, WalletCards, Wallet, ArrowLeft, ChevronRight,
  Star, Clock, ShieldCheck, ShieldAlert, CreditCard, Video, MessageSquare, 
  Send, CheckCircle, Smile, Camera, RefreshCw, X, MessageCircleQuestion, Info, Mailbox, Mail,
  Lock, Unlock, Eye, EyeOff, Trash2, History, FileText, Share2, Award, Bell, Globe
} from "lucide-react";

type View = "home" | "Gigs" | "Seekers" | "Wallet" | "Instructions" | "Business" | "Admin" | "Inbox";
type AppStep = "list" | "detail" | "apply_text" | "apply_video" | "create_gig" | "register_start" | "register_confirm_email" | "seeker_signup" | "seeker_docs" | "seeker_scanning" | "seeker_confirm" | "wallet_topup" | "wallet_payment_upload" | "wallet_transfer" | "business_signup" | "business_docs" | "business_scanning" | "admin_login" | "success" | "profile_detail" | "view_application";

interface Business {
  id: number;
  name: string;
  industry: string;
  location: string;
  description: string;
  logo?: string;
  isVerified?: boolean;
  email: string;
  phone: string;
  website?: string;
}

interface Seeker {
  id: number;
  name: string;
  category: string;
  education: string;
  experience: string;
  skills: string[];
  bio: string;
  avatar?: string;
  videoIntro?: string;
  email: string;
  phone: string;
  location: string;
  isVerified?: boolean;
  idDocuments?: string[];
  shareIdOption?: "none" | "gigs" | "verified" | "all";
  idViewLogs?: { id: number; viewer: string; role: string; timestamp: string }[];
}

interface Application {
  id: number;
  gigId: number;
  seeker: Seeker;
  status: "pending" | "approved" | "rejected";
}

interface Gig {
  id: number;
  title: string;
  description: string;
  pay: string;
  location: string;
  category: string;
  images?: string[];
}

interface Transaction {
  id: number;
  type: "topup" | "transfer" | "received";
  amount: number;
  coinAmount?: number;
  desc: string;
  date: string;
  proof?: string;
  status?: "pending" | "approved" | "rejected";
}

const INITIAL_GIGS: Gig[] = [
  { id: 1, title: "Dog Walking", description: "Need someone to walk Buddy for 30 mins in the park.", pay: "250", location: "Green Point", category: "Pet Care", images: ["https://images.unsplash.com/photo-1551730459-92db2a308d6a?q=80&w=1000"] },
  { id: 2, title: "Grocery Help", description: "Help elderly neighbor with weekly grocery shopping and unloading.", pay: "400", location: "Sandton", category: "Errands", images: ["https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000"] },
  { id: 3, title: "Plant Watering", description: "Water my indoor collection while I'm away for the weekend.", pay: "150", location: "Camps Bay", category: "Home", images: ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000"] },
  { id: 4, title: "Move Boxes", description: "Help move 5-10 boxes from a 2nd-floor apartment to a van.", pay: "600", location: "Umhlanga", category: "Labor", images: ["https://images.unsplash.com/photo-1600585152220-903c3fe7e115?q=80&w=1000"] },
];

const INITIAL_APPLICATIONS: Application[] = [
  { id: 1, gigId: 1, seeker: { id: 1, name: "Thabo Mokoena", category: "Handyman", education: "Technical Certificate", experience: "5 Years Plumbing & Electrical", skills: ["Plumbing", "Electrical", "Painting"], bio: "Reliable and fast service in the North.", email: "thabo.m@portal.com", phone: "+27 82 555 0123", location: "Cape Town", isVerified: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000", videoIntro: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", idDocuments: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600"], shareIdOption: "verified", idViewLogs: [{ id: 1, viewer: "Build-It Better", role: "Verified Business", timestamp: "2026-06-03 10:14 UTC" }] }, status: "pending" }
];

const INITIAL_SEEKERS: Seeker[] = [
  { 
    id: 1, 
    name: "Thabo Mokoena", 
    category: "Handyman", 
    education: "Technical Certificate", 
    experience: "5 Years Plumbing & Electrical", 
    skills: ["Plumbing", "Electrical", "Painting"], 
    bio: "Reliable and fast service in the North.", 
    email: "thabo.m@portal.com", 
    phone: "+27 82 555 0123", 
    location: "Cape Town", 
    isVerified: true, 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000",
    videoIntro: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    idDocuments: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600"],
    shareIdOption: "verified",
    idViewLogs: [
      { id: 1, viewer: "Build-It Better", role: "Verified Business", timestamp: "2026-06-03 10:14 UTC" }
    ]
  },
  { 
    id: 2, 
    name: "Sarah Jacobs", 
    category: "Cleaning", 
    education: "High School Diploma", 
    experience: "3 Years Hospitality", 
    skills: ["Deep Cleaning", "Organizing", "Ironing"], 
    bio: "Meticulous cleaner with great references.", 
    email: "sarah.j@portal.com", 
    phone: "+27 71 555 0456", 
    location: "Johannesburg", 
    isVerified: true, 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000",
    idDocuments: ["https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600"],
    shareIdOption: "all",
    idViewLogs: []
  },
];

const INITIAL_BUSINESSES: Business[] = [
  { id: 1, name: "Build-It Better", industry: "Construction", location: "Cape Town", description: "Leading construction and renovation firm.", isVerified: true, email: "contact@buildit.co.za", phone: "021 555 7890", website: "buildit.co.za", logo: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000" },
  { id: 2, name: "Clean Sweep Co", industry: "Services", location: "Johannesburg", description: "Premium cleaning services for corporate clients.", isVerified: true, email: "info@cleansweep.com", phone: "011 555 1234", logo: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=1000" },
];

// Extracted swinging hook
function useSwingingSound(isActive: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const playSqueak = () => {
      if (!isActive) return;
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') return; // Do not force resume here if not permitted

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';

      const t = ctx.currentTime;
      // Frequencies for a squeaky hinge
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.linearRampToValueAtTime(750, t + 0.3);
      osc.frequency.linearRampToValueAtTime(500, t + 0.8);

      osc2.frequency.setValueAtTime(650, t);
      osc2.frequency.linearRampToValueAtTime(800, t + 0.3);
      osc2.frequency.linearRampToValueAtTime(550, t + 0.8);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, t);
      filter.Q.value = 10;

      gain.gain.setValueAtTime(0, t);
      // subtle ambient sound
      gain.gain.linearRampToValueAtTime(0.04, t + 0.2); 
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.9);
      osc2.stop(t + 0.9);
    };

    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    const handleInteraction = () => {
      initAudio();
      if (isActive && !isPlayingRef.current) {
        isPlayingRef.current = true;
        intervalRef.current = setInterval(() => {
          playSqueak();
        }, 1250);
        playSqueak();
      }
    };

    if (isActive) {
      window.addEventListener('click', handleInteraction, { once: true });
      window.addEventListener('keydown', handleInteraction, { once: true });
    } else {
      isPlayingRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);
}

function useHammeringSound(triggerCount: number) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (triggerCount === 0) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {}); // Attempt to resume if allowed
    }

    const playHit = (startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, startTime);
      osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.1); // Pitch drop for impact

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, startTime);
      filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.1);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(1, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    };

    const now = ctx.currentTime;
    playHit(now);      // Hit 1
    playHit(now + 0.3); // Hit 2
    playHit(now + 0.6); // Hit 3

  }, [triggerCount]);
}

function useCashSound(triggerCount: number, enabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (triggerCount === 0 || !enabled) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    
    // Quick ching sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    // Second ping
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1500, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
    
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);

  }, [triggerCount, enabled]);
}

function useNeedleDropSound(triggerCount: number, enabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (triggerCount === 0 || !enabled) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    
    for (let i = 0; i < 6; i++) {
        const timeOffset = now + i * 0.05 + Math.random() * 0.02;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(3000 + Math.random()*2000, timeOffset);
        
        filter.type = 'highpass';
        filter.frequency.value = 4000;
        filter.Q.value = 5;

        gain.gain.setValueAtTime(0, timeOffset);
        gain.gain.linearRampToValueAtTime(0.2, timeOffset + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(timeOffset);
        osc.stop(timeOffset + 0.1);
    }

  }, [triggerCount, enabled]);
}

export default function App() {
  const [activeView, setActiveView] = useState<View>("Gigs");
  const [appStep, setAppStep] = useState<AppStep>("list");
  const [allGigs, setAllGigs] = useState<Gig[]>(INITIAL_GIGS);
  const [allSeekers, setAllSeekers] = useState<Seeker[]>(INITIAL_SEEKERS);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>(INITIAL_BUSINESSES);
  const [hammerTrigger, setHammerTrigger] = useState(0);

  const [walletSoundsEnabled, setWalletSoundsEnabled] = useState(() => {
    return localStorage.getItem("timeGigWalletSounds") !== "false";
  });
  const [cashTrigger, setCashTrigger] = useState(0);
  const [needleTrigger, setNeedleTrigger] = useState(0);

  useCashSound(cashTrigger, walletSoundsEnabled);
  useNeedleDropSound(needleTrigger, walletSoundsEnabled);

  const [currentUserProfile, setCurrentUserProfile] = useState<Seeker | null>(() => {
    const saved = localStorage.getItem("timeGigUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentBusinessProfile, setCurrentBusinessProfile] = useState<Business | null>(() => {
    const saved = localStorage.getItem("timeGigBusiness");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem("timeGigAdmin") === "true";
  });
  const [adminPasscode, setAdminPasscode] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashPhase, setSplashPhase] = useState<'swinging' | 'nailing'>('swinging');
  const [showInstructions, setShowInstructions] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");

  useSwingingSound(splashPhase === 'swinging');
  useHammeringSound(hammerTrigger);

  useEffect(() => {
    if (showSplash && splashPhase === 'nailing') {
      setHammerTrigger(prev => prev + 1);
    }
  }, [splashPhase, showSplash]);

  useEffect(() => {
    if (appStep === "success") {
      setHammerTrigger(prev => prev + 1);
    }
  }, [appStep]);

  useEffect(() => {
    if (currentUserProfile) {
      localStorage.setItem("timeGigUser", JSON.stringify(currentUserProfile));
    } else {
      localStorage.removeItem("timeGigUser");
    }
  }, [currentUserProfile]);

  useEffect(() => {
    if (currentBusinessProfile) {
      localStorage.setItem("timeGigBusiness", JSON.stringify(currentBusinessProfile));
    } else {
      localStorage.removeItem("timeGigBusiness");
    }
  }, [currentBusinessProfile]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      localStorage.setItem("timeGigAdmin", "true");
    } else {
      localStorage.removeItem("timeGigAdmin");
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    const swingTimer = setTimeout(() => {
      setSplashPhase('nailing');
    }, 4000);
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5500);
    return () => {
      clearTimeout(swingTimer);
      clearTimeout(timer);
    };
  }, []);
  
  // Wallet State
  const [balance, setBalance] = useState(0.00);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    localStorage.setItem("timeGigWalletSounds", walletSoundsEnabled.toString());
  }, [walletSoundsEnabled]);

  useEffect(() => {
    if (balance > prevBalanceRef.current) {
      setCashTrigger(prev => prev + 1);
    }
    prevBalanceRef.current = balance;
  }, [balance]);
  
  // Custom Alert Interfaces & States
  const [acceptedShare, setAcceptedShare] = useState(false);
  const [notificationAlerts, setNotificationAlerts] = useState<{
    id: number;
    sender: string;
    text: string;
    time: string;
    unread: boolean;
    type: "view" | "document" | "gig" | "seeker" | "wallet" | "general" | "system";
  }[]>([
    { id: 101, sender: "Gig Board Manager", text: "Welcome! Every new user receives 10 coins reward setup automatically.", time: "1h ago", unread: true, type: "system" },
    { id: 102, sender: "Security Guard", text: "Biographical lock bounds activated. All seeker ID documents are safely encrypted.", time: "2h ago", unread: false, type: "document" },
    { id: 103, sender: "Gig Finder Alert", text: "New Gig 'Local Plumbing & Pipe Overhaul' is currently trending in your Local Area.", time: "4h ago", unread: false, type: "gig" }
  ]);
  const prevAlertsLengthRef = useRef(notificationAlerts.length);

  useEffect(() => {
    if (notificationAlerts.length > prevAlertsLengthRef.current) {
      setNeedleTrigger(prev => prev + 1);
    }
    prevAlertsLengthRef.current = notificationAlerts.length;
  }, [notificationAlerts.length]);

  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [appliedWallpaperColor, setAppliedWallpaperColor] = useState("#FDFDFD");
  const [appliedWallpaperImage, setAppliedWallpaperImage] = useState<string | null>(null);
  const [tempWallpaperColor, setTempWallpaperColor] = useState("#FDFDFD");
  const [tempWallpaperImage, setTempWallpaperImage] = useState<string | null>(null);
  const [wallpaperOpacity, setWallpaperOpacity] = useState<number>(10);
  const [tempWallpaperOpacity, setTempWallpaperOpacity] = useState<number>(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAccountDisabled, setIsAccountDisabled] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [transferTarget, setTransferTarget] = useState<Seeker | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedSeeker, setSelectedSeeker] = useState<Seeker | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [showSentMessage, setShowSentMessage] = useState(false);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [secureIdDocs, setSecureIdDocs] = useState<string[] | null>(null);
  const [secureIdOwnerName, setSecureIdOwnerName] = useState<string>("");
  
  // Seeker Form State
  const [seekerAvatar, setSeekerAvatar] = useState<string | null>(null);
  const [seekerName, setSeekerName] = useState("");
  const [seekerEmail, setSeekerEmail] = useState("");
  const [seekerPhone, setSeekerPhone] = useState("");
  const [seekerBio, setSeekerBio] = useState("");
  const [seekerCategory, setSeekerCategory] = useState("General");
  const [seekerEducation, setSeekerEducation] = useState("");
  const [seekerExperience, setSeekerExperience] = useState("");
  const [seekerSkills, setSeekerSkills] = useState("");
  const [seekerLetter, setSeekerLetter] = useState("");
  const [seekerVideo, setSeekerVideo] = useState<string | null>(null);

  // Business Form State
  const [bizName, setBizName] = useState("");
  const [bizIndustry, setBizIndustry] = useState("General");
  const [bizLocation, setBizLocation] = useState("");
  const [bizDesc, setBizDesc] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizLogo, setBizLogo] = useState<string | null>(null);
  const [bizDocs, setBizDocs] = useState<string[]>([]);
  const [seekerDocs, setSeekerDocs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<"pending" | "success" | "fail">("pending");

  const [reason, setReason] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(60);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  
  // New Gig Form State
  const [newGigTitle, setNewGigTitle] = useState("");
  const [newGigDescription, setNewGigDescription] = useState("");
  const [newGigLocation, setNewGigLocation] = useState("");
  const [newGigPrice, setNewGigPrice] = useState("");
  const [newGigImages, setNewGigImages] = useState<string[]>([]);
  const [gigsCategory, setGigsCategory] = useState("All");
  const [seekersCategory, setSeekersCategory] = useState("All");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const adminWallpaperInputRef = useRef<HTMLInputElement>(null);
  const seekerAvatarRef = useRef<HTMLInputElement>(null);
  const bizLogoRef = useRef<HTMLInputElement>(null);

  const handleOpenShareLink = (platformName: string) => {
    const rawUrl = window.location.href || "";
    const cleanUrl = rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1") 
      ? "https://ais-dev-znypx44hgtjlfwr6mnkfjb-823072152260.europe-west2.run.app" 
      : rawUrl || "https://app.co.za";
      
    const message = "Check out our app - South Africa's instant job onboarding and micropayment community network! 🚀🇿🇦";
    
    switch (platformName) {
      case "Twitter / X":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(cleanUrl)}`, "_blank", "noopener,noreferrer");
        break;
      case "WhatsApp":
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message + " " + cleanUrl)}`, "_blank", "noopener,noreferrer");
        break;
      case "Facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl)}`, "_blank", "noopener,noreferrer");
        break;
      case "Copy Link":
        navigator.clipboard.writeText(cleanUrl);
        break;
      default:
        break;
    }
  };

  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const navItems = useMemo(() => {
    const items = [
      { id: "Gigs", label: "Gigs", color: "bg-blue-100/50", icon: BriefcaseBusiness, description: "Explore available opportunities" },
      { id: "Seekers", label: "Seekers", color: "bg-purple-100/50", icon: UserSearch, description: "Find the best talent for your projects" },
      { id: "Wallet", label: "Wallet", color: "bg-indigo-100/50", icon: WalletCards, description: "Track earnings and transactions" },
      { id: "Inbox", label: "Inbox", color: "bg-amber-100/50", icon: Mailbox, description: "Messages and Notifications" },
      { id: "Instructions", label: "Help", color: "bg-emerald-100/50", icon: MessageCircleQuestion, description: "Learn how to use the portal" },
      { id: "Admin", label: "Admin", color: "bg-red-100/50", icon: ShieldAlert, description: "Admin Dashboard" },
    ];
    
    return items;
  }, []);

  useEffect(() => {
    if (isPreviewing && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isPreviewing]);

  const startCamera = async () => {
    setCameraError(null);
    setIsSimulated(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }, 
        audio: true 
      });
      streamRef.current = stream;
      setIsPreviewing(true);
    } catch (err) {
      console.warn("Audio + Video failed, trying Video only:", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          }, 
          audio: false 
        });
        streamRef.current = stream;
        setIsPreviewing(true);
      } catch (err2) {
        console.error("Error accessing camera:", err2);
        setCameraError("Real camera access blocked or unavailable inside this sandbox environment. Please use 'Simulator Practice Mode'.");
      }
    }
  };

  const startCameraSimulator = () => {
    setCameraError(null);
    setIsSimulated(true);
    setIsPreviewing(true);
  };

  const startRecording = () => {
    if (isSimulated) {
      setIsRecording(true);
      setRecordTime(60);
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
    }

    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    
    let options: any = {};
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=h264,opus",
      "video/webm",
      "video/mp4;codecs=avc1,mp4a",
      "video/mp4"
    ];
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        options = { mimeType: mime };
        break;
      }
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = options.mimeType || "video/webm";
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoURL);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordTime(60);
      
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      console.error("Error starting MediaRecorder:", e);
      setIsRecording(true);
      setRecordTime(60);
      
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setIsPreviewing(false);
    setIsSimulated(false);
  };

  const handleBack = () => {
    setFullscreenImage(null);
    stopCamera();
    if (appStep === "detail" || appStep === "create_gig" || appStep === "seeker_signup" || appStep === "wallet_topup" || appStep === "wallet_transfer" || appStep === "business_signup" || appStep === "admin_login" || appStep === "profile_detail" || appStep === "business_docs" || appStep === "seeker_docs") setAppStep("list");
    else if (appStep === "apply_text" || appStep === "apply_video") setAppStep("detail");
    else if (appStep === "seeker_confirm") setAppStep("seeker_signup");
    else if (appStep === "success") {
      setAppStep("list");
      setSelectedGig(null);
      setSelectedSeeker(null);
      setSelectedBusiness(null);
      resetNewGigForm();
      resetSeekerForm();
      resetWalletForm();
      resetBusinessForm();
    } else {
      setActiveView("Gigs");
      setAppStep("list"); // Reset step
      setLoginError(false);
      setAdminPasscode("");
    }
  };

  const handleAdminLogin = () => {
    if (adminPasscode === "1234") {
      setIsAdminAuthenticated(true);
      setAppStep("list");
      setLoginError(false);
    } else {
      setLoginError(true);
      setAdminPasscode("");
    }
  };

  const renderAdminView = () => {
    if (!isAdminAuthenticated) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center mb-8 shadow-2xl shadow-slate-200">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Access</h2>
          <p className="text-slate-500 mt-2 text-sm">Enter the administrator passcode to proceed.</p>
          
          <div className="mt-10 w-full max-w-xs space-y-4">
            <input 
              type="password"
              placeholder="••••"
              value={adminPasscode}
              onChange={(e) => setAdminPasscode(e.target.value)}
              className={`w-full bg-white border ${loginError ? 'border-red-300' : 'border-slate-100'} rounded-[24px] px-6 py-5 text-center text-2xl font-black tracking-[1em] focus:border-slate-300 outline-none shadow-inner`}
            />
            {loginError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Access Denied</p>}
            
            <button 
              onClick={handleAdminLogin}
              className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold shadow-xl hover:bg-black active:scale-95 transition-all"
            >
              Unlock Dashboard
            </button>
          </div>
          <p className="mt-12 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Hint: 1234</p>
        </div>
      );
    }

    const stats = [
      { label: "Active Gigs", value: allGigs.length, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Total Seekers", value: allSeekers.length, color: "text-purple-600", bg: "bg-purple-50" },
      { label: "Businesses", value: allBusinesses.length, color: "text-orange-600", bg: "bg-orange-50" },
      { label: "Wallet Volume", value: `R${balance.toLocaleString()}`, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
      <div className="space-y-8 px-6 pt-20 pb-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800">Admin Console</h2>
            <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Secure Connection Active
            </p>
          </div>
          <button 
            onClick={() => setIsAdminAuthenticated(false)}
            className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className={`${s.bg} p-6 rounded-[32px] border border-white shadow-sm`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className={`text-xl font-black ${s.color}`}>{s.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            Transaction Management
          </h3>
          <div className="space-y-4">
            {transactions.filter(t => t.type === "topup").map(t => (
                <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold">{t.desc}</p>
                        <p className="text-[10px] text-slate-500">{t.status || "Pending"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {t.proof && (
                            <button 
                                onClick={() => setFullscreenImage(t.proof!)}
                                className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-indigo-600 border border-indigo-200"
                            >
                                View Proof
                            </button>
                        )}
                        {t.status === "pending" && (
                            <>
                                <button 
                                    onClick={() => {
                                        setTransactions(prev => prev.map(tr => tr.id === t.id ? {...tr, status: "approved"} : tr));
                                        if (t.coinAmount) {
                                            setBalance(prev => prev + t.coinAmount!);
                                        }
                                    }}
                                    className="px-3 py-1 bg-emerald-100 rounded-full text-[10px] font-black text-emerald-600"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => setTransactions(prev => prev.map(tr => tr.id === t.id ? {...tr, status: "rejected"} : tr))}
                                    className="px-3 py-1 bg-red-100 rounded-full text-[10px] font-black text-red-600"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}
            {transactions.filter(t => t.type === "topup").length === 0 && (
                <p className="text-center text-xs text-slate-400">No pending transactions</p>
            )}
          </div>
        </div>

        {/* Portal Branding and Wallpaper Customization */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 space-y-6 shadow-sm text-left">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-base">Portal Wallpaper & Backdrop</h3>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            Customize the global background ambiance for all users on this browser thread. Changes are applied immediately to the main canvas.
          </p>

          <div className="space-y-4">
            {/* Color section */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                Backdrop Canvas Solid Color
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={tempWallpaperColor}
                  onChange={(e) => setTempWallpaperColor(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border border-slate-200 overflow-hidden shrink-0" 
                />
                <input 
                  type="text" 
                  value={tempWallpaperColor}
                  onChange={(e) => setTempWallpaperColor(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-600 focus:outline-none focus:border-slate-300"
                  placeholder="#FDFDFD"
                  maxLength={7}
                />
              </div>

              {/* Color Presets */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { value: "#FDFDFD", name: "Default" },
                  { value: "#f0fdf4", name: "Mint" },
                  { value: "#fff1f2", name: "Rose" },
                  { value: "#fffbeb", name: "Amber" },
                  { value: "#ecfeff", name: "Cyan" },
                  { value: "#0f172a", name: "Carbon" },
                  { value: "#1e1b4b", name: "Indigo" },
                  { value: "#180828", name: "Cosmic" },
                  { value: "#edf2f7", name: "Slate" },
                  { value: "#faf5ff", name: "Lilac" }
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setTempWallpaperColor(preset.value)}
                    type="button"
                    className="p-1 rounded-lg border border-slate-100 hover:border-slate-300 flex flex-col items-center gap-1 transition-all cursor-pointer bg-slate-50/50"
                  >
                    <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: preset.value }} />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image Section */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                Wallpaper Image Backdrop
              </label>

              {tempWallpaperImage ? (
                <div className="relative aspect-[3/1] bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 justify-start">
                    <img src={tempWallpaperImage} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Custom Wallpaper Loaded</p>
                      <p className="text-[8px] font-medium text-slate-400">Ready to extend backdrop</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTempWallpaperImage(null)}
                    type="button"
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors cursor-pointer mr-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => adminWallpaperInputRef.current?.click()}
                  className="w-full py-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-500 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50"
                >
                  <Camera className="w-4 h-4 text-slate-400" />
                  Upload Image from Device
                </button>
              )}
              <input 
                type="file" 
                ref={adminWallpaperInputRef} 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setTempWallpaperImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
                className="hidden" 
              />
            </div>

            {/* Preset Backdrop Wallpapers */}
            <div className="space-y-2 pt-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Preset Wallpapers</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600",
                  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600",
                  "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600",
                ].map((presetUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setTempWallpaperImage(presetUrl)}
                    type="button"
                    className={`aspect-[3/2] rounded-xl border overflow-hidden relative cursor-pointer group ${
                      tempWallpaperImage === presetUrl ? 'ring-2 ring-indigo-500 border-indigo-400' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={presetUrl} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Control */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-slate-400">
                <span>Wallpaper Opacity / Blend</span>
                <span className="font-mono text-slate-600">{tempWallpaperOpacity}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={tempWallpaperOpacity} 
                onChange={(e) => setTempWallpaperOpacity(Number(e.target.value))} 
                className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Apply Action Trigger */}
            <div className="flex gap-2.5 pt-4 border-t border-slate-50">
              <button
                onClick={() => {
                  setTempWallpaperColor("#FDFDFD");
                  setTempWallpaperImage(null);
                  setTempWallpaperOpacity(10);
                  
                  // Immediately apply default values too
                  setAppliedWallpaperColor("#FDFDFD");
                  setAppliedWallpaperImage(null);
                  setWallpaperOpacity(10);
                }}
                className="flex-1 py-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all active:scale-95 border border-slate-200/50"
              >
                Reset Default
              </button>
              <button
                onClick={() => {
                  setAppliedWallpaperColor(tempWallpaperColor);
                  setAppliedWallpaperImage(tempWallpaperImage);
                  setWallpaperOpacity(tempWallpaperOpacity);
                }}
                className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 text-white font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all active:scale-95 inline-flex items-center justify-center gap-1.5"
              >
                Apply Wallpaper
              </button>
            </div>
          </div>
        </div>

        <button 
          className="w-full py-5 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-300 font-bold text-xs uppercase tracking-widest hover:border-slate-400 hover:text-slate-400 transition-all"
        >
          Generate System Report
        </button>
      </div>
    );
  };

  const renderInstructionsView = () => {
    const steps = [
      {
        icon: BriefcaseBusiness,
        title: "The Gig Market",
        color: "text-blue-500",
        bg: "bg-blue-50",
        text: "Browse or post casual jobs. When you pick a gig, you can apply using a text reason or record a 60-second video intro to stand out."
      },
      {
        icon: UserSearch,
        title: "Seeker Directory",
        color: "text-purple-500",
        bg: "bg-purple-50",
        text: "Register as a seeker to show your skills to the community. Complete your profile with education and experience."
      },
      {
        icon: WalletCards,
        title: "Digital Wallet",
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        text: "Manage your earnings in Rands. Top up your balance or transfer coins instantly to other seekers."
      },
      {
        icon: Camera,
        title: "Media Support",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        text: "Upload multiple photos when posting. Clinical images can be tapped to see them full-screen."
      }
    ];

    return (
      <div className="space-y-6 px-6 pt-20 pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Help Center</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master the marketplace</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white rounded-[24px] border border-slate-50 shadow-sm p-5 flex flex-col gap-4 group transition-all hover:shadow-xl"
            >
              <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center shrink-0`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-slate-800 text-xs leading-tight">{step.title}</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium line-clamp-4">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };


  function resetWalletForm() {}

  const resetNewGigForm = () => {
    setNewGigTitle("");
    setNewGigDescription("");
    setNewGigLocation("");
    setNewGigPrice("");
    setNewGigImages([]);
  };

  const resetSeekerForm = () => {
    setSeekerAvatar(null);
    setSeekerName("");
    setSeekerEmail("");
    setSeekerPhone("");
    setSeekerBio("");
    setSeekerCategory("General");
    setSeekerEducation("");
    setSeekerExperience("");
    setSeekerSkills("");
    setSeekerLetter("");
    setSeekerVideo(null);
    setSeekerDocs([]);
    setScanResult("pending");
    setScanProgress(0);
  };

  const resetBusinessForm = () => {
    setBizName("");
    setBizIndustry("General");
    setBizLocation("");
    setBizDesc("");
    setBizEmail("");
    setBizPhone("");
    setBizLogo(null);
    setBizDocs([]);
    setScanResult("pending");
    setScanProgress(0);
  };

  const getViewerInfo = () => {
    if (isAdminAuthenticated) {
      return { name: "System Administrator", role: "Administrator", email: "admin@platform.gov" };
    }
    if (currentBusinessProfile) {
      return { name: currentBusinessProfile.name, role: "Verified Business", email: currentBusinessProfile.email };
    }
    if (currentUserProfile) {
      return { name: currentUserProfile.name, role: "Seeker Profile", email: currentUserProfile.email };
    }
    return { name: "General Guest Viewer", role: "Visitor", email: "guest@platform.portal" };
  };

  const checkIdAccess = (seeker: Seeker) => {
    if (currentUserProfile?.id === seeker.id) {
      return { hasAccess: true, reason: "Profile Owner" };
    }
    if (isAdminAuthenticated) {
      return { hasAccess: true, reason: "Admin Override" };
    }
    
    const option = seeker.shareIdOption || "none";
    if (option === "none") {
      return { hasAccess: false, restriction: "Private (Owner only)" };
    }
    
    if (option === "all") {
      return { hasAccess: true, reason: "Public share setting" };
    }
    
    if (option === "verified") {
      if (currentBusinessProfile?.isVerified) {
        return { hasAccess: true, reason: "Verified Business credentials" };
      }
      return { hasAccess: false, restriction: "Verified Businesses Only" };
    }
    
    if (option === "gigs") {
      const hasApplication = applications.some(a => a.seeker.id === seeker.id);
      if (hasApplication && currentBusinessProfile) {
        return { hasAccess: true, reason: "Active Gig Application link" };
      }
      return { hasAccess: false, restriction: "Active Gig Applicants Only" };
    }
    
    return { hasAccess: false, restriction: "Protected by platform rules" };
  };

  const handleViewSeekerProfile = (seeker: Seeker) => {
    setSelectedSeeker(seeker);
    setAppStep("profile_detail");
    
    const viewer = getViewerInfo();
    if (currentUserProfile?.id !== seeker.id) {
      const alertText = `Profile View Alert: "${viewer.name}" (${viewer.role}) viewed your professional seeker profile.`;
      const newAlert = {
        id: Date.now() + Math.random(),
        sender: viewer.name,
        text: alertText,
        time: "Just now",
        unread: true,
        type: "view" as const
      };
      setNotificationAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleViewBusinessProfile = (biz: Business) => {
    setSelectedBusiness(biz);
    setAppStep("profile_detail");
    
    const viewer = getViewerInfo();
    const alertText = `Profile View Alert: "${viewer.name}" (${viewer.role}) viewed your business profile.`;
    const newAlert = {
      id: Date.now() + Math.random(),
      sender: viewer.name,
      text: alertText,
      time: "Just now",
      unread: true,
      type: "view" as const
    };
    setNotificationAlerts(prev => [newAlert, ...prev]);
  };

  const logIdView = (seekerId: number) => {
    const viewer = getViewerInfo();
    const newLog = {
      id: Date.now(),
      viewer: viewer.name,
      role: viewer.role,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
    };
    
    // Trigger notification for Document access
    if (currentUserProfile?.id !== seekerId) {
      const alertText = `Document Access Alert: "${viewer.name}" (${viewer.role}) accessed your encrypted ID documents in the secure vault.`;
      const newAlert = {
        id: Date.now() + Math.random(),
        sender: "Security Vault",
        text: alertText,
        time: "Just now",
        unread: true,
        type: "document" as const
      };
      setNotificationAlerts(prev => [newAlert, ...prev]);
    }
    
    setAllSeekers(prev => prev.map(s => {
      if (s.id === seekerId) {
        const currentLogs = s.idViewLogs || [];
        if (currentLogs.some(l => l.viewer === viewer.name && l.role === viewer.role)) {
          return s;
        }
        const updated = { ...s, idViewLogs: [newLog, ...currentLogs] };
        if (selectedSeeker?.id === s.id) {
          setSelectedSeeker(updated);
        }
        return updated;
      }
      return s;
    }));
  };

  const handleProfileIdUploadChange = (seekerId: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAllSeekers(prev => prev.map(s => {
          if (s.id === seekerId) {
            const currentDocs = s.idDocuments || [];
            const updated = { ...s, idDocuments: [...currentDocs, base64] };
            if (currentUserProfile?.id === s.id) {
              setCurrentUserProfile(updated);
            }
            if (selectedSeeker?.id === s.id) {
              setSelectedSeeker(updated);
            }
            return updated;
          }
          return s;
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateIdPrivacy = (seekerId: number, val: "none" | "gigs" | "verified" | "all") => {
    setAllSeekers(prev => prev.map(s => {
      if (s.id === seekerId) {
        const updated = { ...s, shareIdOption: val };
        if (currentUserProfile?.id === s.id) {
          setCurrentUserProfile(updated);
        }
        if (selectedSeeker?.id === s.id) {
          setSelectedSeeker(updated);
        }
        return updated;
      }
      return s;
    }));
  };

  const handleWipeIdDocuments = (seekerId: number) => {
    setAllSeekers(prev => prev.map(s => {
      if (s.id === seekerId) {
        const updated = { ...s, idDocuments: [], shareIdOption: "none" as const };
        if (currentUserProfile?.id === s.id) {
          setCurrentUserProfile(updated);
        }
        if (selectedSeeker?.id === s.id) {
          setSelectedSeeker(updated);
        }
        return updated;
      }
      return s;
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewGigImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleWallpaperChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeekerAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBizLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBizLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGigSubmit = () => {
    const freshGig: Gig = {
      id: Date.now(),
      title: newGigTitle,
      description: newGigDescription,
      location: newGigLocation,
      pay: newGigPrice,
      category: "Personal Task",
      images: newGigImages
    };
    
    // Add real-time update on latest gigs
    const newAlert = {
      id: Date.now() + Math.random(),
      sender: "Latest Gigs Feed",
      text: `Alert: A new gig "${newGigTitle}" was posted offering ${newGigPrice} pay. Tap to check details now!`,
      time: "Just now",
      unread: true,
      type: "gig" as const
    };
    setNotificationAlerts(prev => [newAlert, ...prev]);
    
    setAllGigs(prev => [freshGig, ...prev]);
    setAppStep("success");
    setSelectedGig(null); // Ensure success message shows gig title
  };

  const handleSeekerSubmit = () => {
    setAppStep("seeker_video");
  };

  const handleSeekerDocsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeekerDocs(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startScanningSeekerDocs = () => {
    setAppStep("seeker_scanning");
    setIsScanning(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (seekerDocs.length >= 2) {
            setScanResult("success");
          } else {
            setScanResult("fail");
          }
          setIsScanning(false);
        }, 1000);
      }
    }, 50);
  };

  const handleBizDocsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBizDocs(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const startScanningDocs = () => {
    setAppStep("business_scanning");
    setIsScanning(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        // Simulation logic: always success if at least 2 docs uploaded
        setTimeout(() => {
          if (bizDocs.length >= 2) {
            setScanResult("success");
            const newBiz: Business = {
              id: Date.now(),
              name: bizName,
              industry: bizIndustry,
              location: bizLocation,
              description: bizDesc,
              email: bizEmail,
              phone: bizPhone,
              logo: bizLogo || undefined,
              isVerified: true
            };
            
            // Calculate and award coin bonuses
            const signupBonus = 10;
            const shareBonus = acceptedShare ? 15 : 0;
            const totalEarned = signupBonus + shareBonus;
            setBalance(prev => prev + totalEarned);
            
            // Create ledger transactions
            const txs: Transaction[] = [
              {
                id: Date.now(),
                type: "received",
                amount: signupBonus,
                desc: "Business Onboarding Bonus",
                date: new Date().toLocaleDateString()
              }
            ];
            
            if (shareBonus > 0) {
              txs.push({
                id: Date.now() + 1,
                type: "received",
                amount: shareBonus,
                desc: "Social Media Sharing Registration Reward",
                date: new Date().toLocaleDateString()
              });
            }
            setTransactions(prev => [...txs, ...prev]);

            // Broadcast business registation update alert
            const newAlert = {
              id: Date.now() + Math.random(),
              sender: "Corporate Onboarding",
              text: `New Business Alert: "${bizName}" (${bizIndustry}) joined the network. Welcome!`,
              time: "Just now",
              unread: true,
              type: "seeker" as const
            };
            setNotificationAlerts(prev => [newAlert, ...prev]);

            setAllBusinesses(prev => [newBiz, ...prev]);
            setCurrentBusinessProfile(newBiz);
          } else {
            setScanResult("fail");
          }
          setIsScanning(false);
        }, 1000);
      }
    }, 50);
  };

  const handleBusinessSubmit = () => {
    setAppStep("business_docs");
  };

  const handleConfirmSeeker = (include: boolean) => {
    if (include) {
      const newSeeker: Seeker = {
        id: Date.now(),
        name: seekerName,
        category: seekerCategory,
        education: seekerEducation,
        experience: seekerExperience,
        skills: seekerSkills.split(',').map(s => s.trim()),
        bio: seekerBio,
        avatar: seekerAvatar || undefined,
        videoIntro: seekerVideo || undefined,
        email: seekerEmail,
        phone: seekerPhone,
        location: seekerCategory === "Creative" ? "Remote" : "Local Area",
        isVerified: true
      };
      
      // Calculate and award coin bonuses
      const signupBonus = 10;
      const shareBonus = acceptedShare ? 15 : 0;
      const totalEarned = signupBonus + shareBonus;
      
      setBalance(prev => prev + totalEarned);
      
      // Create ledger transactions
      const txs: Transaction[] = [
        {
          id: Date.now(),
          type: "received",
          amount: signupBonus,
          desc: "New User Welcome Bonus",
          date: new Date().toLocaleDateString()
        }
      ];
      
      if (shareBonus > 0) {
        txs.push({
          id: Date.now() + 1,
          type: "received",
          amount: shareBonus,
          desc: "Social Media Sharing Registration Reward",
          date: new Date().toLocaleDateString()
        });
      }
      
      setTransactions(prev => [...txs, ...prev]);

      // Broadcast alert about new seeker
      const newAlert = {
        id: Date.now() + Math.random(),
        sender: "Directory Onboarding",
        text: `New Seeker Alert: ${seekerName} specializes in ${seekerCategory}. View their details and start hiring.`,
        time: "Just now",
        unread: true,
        type: "seeker" as const
      };
      setNotificationAlerts(prev => [newAlert, ...prev]);

      setAllSeekers(prev => [newSeeker, ...prev]);
      setCurrentUserProfile(newSeeker);
      setAppStep("success");
    } else {
      setActiveView("Gigs");
      setAppStep("list");
      resetSeekerForm();
    }
  };

  const saveRecordedVideo = (videoUrl: string) => {
    if (appStep === "seeker_video" || (appStep === "apply_video" && activeView === "Seekers")) {
      setSeekerVideo(videoUrl);
      if (appStep === "seeker_video") {
        setAppStep("seeker_confirm");
      } else {
        if (selectedSeeker) {
          const updated = { ...selectedSeeker, videoIntro: videoUrl };
          setSelectedSeeker(updated);
          setAllSeekers(prev => prev.map(s => s.id === updated.id ? updated : s));
          if (currentUserProfile?.id === updated.id) {
            setCurrentUserProfile(updated);
          }
        }
        setAppStep("profile_detail");
      }
    } else {
      setAppStep("success");
      setReason("");
    }
  };

  const handleSubmit = () => {
    if (isSimulated) {
      const demoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
      setRecordedVideoUrl(demoUrl);
      saveRecordedVideo(demoUrl);
      stopCamera();
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = () => {
        const mime = mediaRecorderRef.current?.mimeType || "video/webm";
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const realVideoURL = URL.createObjectURL(blob);
        setRecordedVideoUrl(realVideoURL);
        saveRecordedVideo(realVideoURL);
      };
      mediaRecorderRef.current.stop();
    } else {
      const fallbackVid = recordedVideoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
      saveRecordedVideo(fallbackVid);
    }
    stopCamera();
  };

  const renderVideoRecordingView = (title: string, subtitle: string) => {
    return (
      <div className="space-y-6 h-full flex flex-col pt-16 px-4 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl border border-red-100 animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              <span className="text-xs font-black uppercase tracking-widest font-mono">REC</span>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-amber-800 text-xs font-semibold flex flex-col gap-2">
            <p className="leading-relaxed flex items-center gap-2">
              <span className="text-sm">⚠️</span> {cameraError}
            </p>
          </div>
        )}
        
        <div className="flex-1 bg-slate-900 min-h-[380px] rounded-[40px] overflow-hidden relative border-[6px] border-white shadow-2xl ring-1 ring-slate-100">
          {!isPreviewing ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center bg-gradient-to-b from-slate-900 to-slate-950">
              <div className="w-20 h-20 rounded-[30px] bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                <Camera className="w-8 h-8 text-white/40" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-white text-lg font-black tracking-tight">Camera & Micro-pitch Options</h3>
                <p className="text-white/40 text-xs max-w-[280px] mx-auto leading-relaxed">
                  Sandbox environments occasionally restrict camera controls. Choose your preferred method below:
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={startCamera}
                  className="bg-white hover:bg-slate-50 text-slate-900 py-4 px-6 rounded-[20px] font-black tracking-wide text-xs shadow-xl active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Try Device Webcam
                </button>
                <button 
                  onClick={startCameraSimulator}
                  className="bg-[#ff5500] hover:bg-[#e04b00] text-white py-4 px-6 rounded-[20px] font-black tracking-wide text-xs shadow-xl shadow-[#ff5500]/10 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-white animate-spin-slow" />
                  Try Portal Simulator Mode
                </button>
              </div>
            </div>
          ) : (
            <>
              {isSimulated ? (
                <div className="w-full h-full absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/20" />
                  {/* Glowing scanner ring */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,85,0,0.12),transparent_75%)] opacity-80 animate-pulse" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-[#ff5500]/20 rounded-full flex items-center justify-center">
                    <motion.div 
                      className="w-56 h-56 border border-dashed border-[#ff5500]/40 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center text-center space-y-4 z-10 p-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden shadow-2xl relative">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        {isRecording && (
                          <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                            <span className="text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded animate-pulse">RECORDING</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#ff5500] text-white p-2 rounded-full shadow-lg">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm tracking-tight flex items-center gap-1.5 justify-center">
                        Jessica van der Merwe <span className="text-emerald-400 text-xs">● Simulated Seeker</span>
                      </h4>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-1">Interactive Sandbox Presenter</p>
                    </div>
                  </div>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1] absolute inset-0" 
                />
              )}
              
              <div className="absolute top-6 left-6 flex items-center gap-4 z-20">
                <div className="relative w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    {isRecording && (
                      <motion.circle 
                        cx="24" cy="24" r="20" 
                        fill="transparent" 
                        stroke="rgba(255,85,0,0.8)" 
                        strokeWidth="3"
                        strokeDasharray={125}
                        initial={{ strokeDashoffset: 125 }}
                        animate={{ strokeDashoffset: 125 - (125 * (60 - recordTime) / 60) }}
                      />
                    )}
                  </svg>
                  <span className="text-white font-black font-mono text-sm">{recordTime}</span>
                </div>
                <div className="space-y-0.5 text-left">
                  <p className="text-white text-[9px] font-black uppercase tracking-widest leading-none">{isRecording ? "Transmitting" : "Mirrored"}</p>
                  <p className="text-white/50 text-[7px] font-bold uppercase tracking-widest leading-none">Capture Core v1.0</p>
                </div>
              </div>

              {!isRecording && (
                <div className="absolute top-6 right-6 z-25">
                   <button 
                     onClick={stopCamera}
                     className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/60 transition-all cursor-pointer"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              )}

              <div className="absolute bottom-8 inset-x-0 px-6 sm:px-8 flex flex-col items-center gap-4 z-20">
                {isRecording && (
                  <div className="flex items-center gap-1 h-6">
                    {[...Array(12)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="w-1 bg-white/40 rounded-full"
                        animate={{ height: [6, 18, 10, 22, 6][i % 5] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                )}

                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="w-full bg-[#ff5500] text-white py-4 sm:py-5 rounded-[20px] font-black uppercase tracking-wider text-xs shadow-2xl hover:bg-[#e04b00] active:scale-95 transition-all border-b-4 border-[#bc3e00] cursor-pointer"
                  >
                    Start 60s Recording
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-white text-slate-900 py-4 sm:py-5 rounded-[20px] font-black uppercase tracking-wider text-xs shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-red-600" />
                    Finish & Submit Clip
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderGigsView = () => {
    switch (appStep) {
      case "list":
        return (
          <div className="space-y-6 px-6 pt-20 pb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span 
                        className="text-3xl font-black tracking-tighter uppercase"
                        style={{
                          color: "transparent",
                          backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
                            repeating-linear-gradient(0deg, transparent, transparent 9px, #333 9px, #333 10px),
                            repeating-linear-gradient(90deg, #b22222, #b22222 12px, #333 12px, #333 13px)
                          `,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.5))"
                        }}
                      >
                        TIME
                      </span>
                      <motion.div
                        style={{ display: "inline-block", transformOrigin: "top left" }}
                        animate={{ rotate: [20, 28, 18, 24, 20] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="relative ml-1 bg-[#faca00] border border-slate-800 rounded px-1.5 py-0 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                      >
                        <div className="absolute -top-0.5 left-1 w-1 h-1 rounded-full border border-slate-800 bg-slate-700 shadow-inner" />
                        <div className="absolute -top-0.5 right-1 w-1 h-1 rounded-full border border-slate-800 bg-black/50 shadow-inner" />
                        <span className="font-mono text-sm font-black text-slate-900 tracking-wider">
                          GIG
                        </span>
                      </motion.div>
                    </div>
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                      Marketplace
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trending On-Demand Gigs & Contracts</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAppStep("register_start")}
                    className="px-4 py-2 rounded-xl text-[10.5px] font-black border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
                  >
                    Register
                  </button>
                  <button 
                    onClick={() => {
                      if (currentBusinessProfile?.isVerified || currentUserProfile?.isVerified) {
                        setAppStep("create_gig");
                      } else {
                        alert("Only verified users and businesses can post gigs. Please complete your profile and verify your account.");
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-[10.5px] font-black shadow-sm flex items-center gap-1.5 transition-all ${
                      (currentBusinessProfile?.isVerified || currentUserProfile?.isVerified)
                        ? "bg-[#3665f3] text-white hover:bg-[#2051d9] active:scale-95" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {(currentBusinessProfile?.isVerified || currentUserProfile?.isVerified) ? <Send className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    POST GIG
                  </button>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search for local tasks, casual gigs or jobs..." 
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-l-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-[46px]"
                  />
                </div>
                <button className="bg-[#3665f3] hover:bg-[#2051d9] text-white px-5 rounded-r-xl font-bold uppercase text-[10px] tracking-wider transition-colors h-[46px] shrink-0 active:scale-95">
                  Search
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100">
                {["All", "Pet Care", "Labor", "Tech", "Errands", "Home"].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setGigsCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[10px] font-bold transition-all ${gigsCategory === cat ? 'bg-[#3665f3] text-white border-[#3665f3] shadow-sm' : 'bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-24">
              {allGigs.filter(g => gigsCategory === "All" || g.category === gigsCategory).map((gig) => {
                // Generate a mock regular rate / strikethrough price for Temu value-dopamine feel
                const numericPay = parseInt(gig.pay.replace(/[^0-9]/g, '')) || 150;
                const wasPayVal = Math.round(numericPay * 1.55);
                const wasPay = `R${wasPayVal}${gig.pay.includes('/hr') ? '/hr' : ''}`;
                const offPercent = 35; // ~35% rate boost / bonus
                
                return (
                  <motion.div 
                    key={gig.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { setSelectedGig(gig); setAppStep("detail"); }}
                    className="bg-white rounded-2xl border border-slate-100 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all overflow-hidden flex flex-col group relative text-left"
                  >
                    {/* Temu-style orange discount label badge */}
                    <div className="absolute top-2 left-2 z-10 bg-[#ff5500] text-white text-[9.5px] font-black px-2 py-0.5 rounded-md tracking-tight flex items-center gap-0.5 uppercase shadow-sm">
                      <span>-{offPercent}%</span>
                      <span className="opacity-80">Boosted</span>
                    </div>

                    <div className="aspect-square bg-slate-50 relative overflow-hidden">
                      {gig.images && gig.images.length > 0 ? (
                        <img src={gig.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50/20 to-slate-100">
                          <Briefcase className="w-10 h-10 text-orange-200" />
                        </div>
                      )}
                      
                      {/* Urgency countdown bar or live spot tracker at the bottom of the image */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-xs py-1.5 px-2.5 text-white text-[8.5px] font-black tracking-widest uppercase flex items-center justify-between">
                        <span className="text-[#ff9900]">⏳ LIGHTNING CONTRACT</span>
                        <span>{Math.floor(Math.random() * 3) + 1} SPOTS LEFT</span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        {/* Title - clean and high density */}
                        <h3 className="font-semibold text-slate-800 text-[13px] sm:text-[14px] leading-snug line-clamp-2 min-h-[2.8rem] group-hover:text-[#ff5500]">
                          {gig.title}
                        </h3>
                        
                        {/* Tags and star rating in one line */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-xs">
                          <div className="flex items-center text-[#ff9900] font-extrabold gap-0.5">
                            <Star className="w-3 h-3 fill-[#ff9900] stroke-none shrink-0" />
                            <span className="text-[11px]">4.9</span>
                          </div>
                          <span className="text-slate-300 font-normal">|</span>
                          <span className="text-slate-400 font-medium truncate">{gig.category}</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 mt-2.5 border-t border-slate-100">
                        {/* Temu-style price slashing / rate comparison */}
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5">
                            <p className="font-extrabold text-[#ff5500] text-base sm:text-[18px] tracking-tight leading-none">
                              {gig.pay}
                            </p>
                            <p className="text-xs text-slate-400 font-medium line-through leading-none">
                              {wasPay}
                            </p>
                          </div>
                          
                          {/* Value feedback statement (e.g. "Free fee", "Instant payout") */}
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="bg-[#ff5500]/5 text-[#ff5500] text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm leading-none">
                              Free Join
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-[#86b817] font-semibold leading-none">
                              🇿🇦 Active
                            </span>
                          </div>
                          
                          {/* Applied / popular stat tracker */}
                          <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold mt-2 text-left">
                            🔥 {Math.floor(Math.random() * 150) + 75} casual workers applied today
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      case "register_start":
        return (
          <div className="space-y-6 h-full flex flex-col px-6 pt-20 pb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Create Account</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Join the community & earn rewards.</p>
            </div>
            
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-left">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Welcome Gift Activated: +10c coins reward!
              </p>
              <p className="text-[9px] text-emerald-600/80 font-black tracking-widest uppercase mt-0.5">Every new user starts with 10 coins automatically</p>
            </div>

            <div className="flex-1 space-y-4">
              <input type="text" placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-medium" />
              <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-medium" />
              <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-medium" />
              
              {/* Social Media Share Checkbox */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-3xl space-y-2 text-left">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={acceptedShare} 
                    onChange={(e) => setAcceptedShare(e.target.checked)} 
                    className="w-5 h-5 rounded-md accent-indigo-600 shrink-0 mt-0.5" 
                  />
                  <div>
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wide block">🚀 Share & Earn 15 Coins Immediately</span>
                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest block leading-tight mt-1">
                      Check this box to auto-share the app on social media to earn an immediate 15 coins bonus upon successful registration!
                    </span>
                  </div>
                </label>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="w-5 h-5 rounded-md accent-indigo-600" />
                <span className="text-xs text-slate-600 font-medium">I accept terms and conditions</span>
              </label>
            </div>
            <button 
              disabled={!regEmail || !regPassword || !regName || !acceptedTerms}
              onClick={() => setAppStep("register_confirm_email")}
              className={`w-full py-5 rounded-3xl font-black text-white ${regEmail && regPassword && regName && acceptedTerms ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              Continue
            </button>
          </div>
        );
      case "register_confirm_email":
        return (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Confirm Email</h2>
            <p className="text-slate-500 mt-2 text-sm max-w-xs">We sent a confirmation link to {regEmail}. Please confirm to proceed.</p>
            <button 
              onClick={() => setAppStep("seeker_signup")}
              className="mt-10 bg-indigo-600 text-white px-10 py-4 rounded-3xl font-bold w-full"
            >
              I have confirmed
            </button>
          </div>
        );
      case "create_gig":
        return (
          <div className="space-y-6 flex flex-col h-full overflow-hidden px-6 pt-20 pb-10">
            <div className="flex flex-col gap-1 pr-1">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tighter">New Gig</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Share the task</p>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pb-4 pr-1">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Upload Images</p>
                <div className="grid grid-cols-3 gap-2">
                   {newGigImages.map((src, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl bg-slate-100 relative group overflow-hidden border border-slate-100">
                      <img src={src} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setNewGigImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {newGigImages.length < 6 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 hover:border-slate-300 transition-colors"
                    >
                      <Camera className="w-6 h-6 text-slate-300" />
                      <span className="text-[8px] font-bold text-slate-400">ADD PHOTOS</span>
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Gig Title (e.g. Garden Cleanup)"
                  value={newGigTitle}
                  onChange={(e) => setNewGigTitle(e.target.value)}
                  className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-blue-200 transition-all font-bold"
                />
                <textarea 
                  placeholder="Describe the task in detail..."
                  value={newGigDescription}
                  onChange={(e) => setNewGigDescription(e.target.value)}
                  className="w-full h-32 bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-blue-200 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Location</p>
                  <input 
                    type="text"
                    placeholder="Area"
                    value={newGigLocation}
                    onChange={(e) => setNewGigLocation(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-blue-200 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Budget</p>
                  <input 
                    type="text"
                    placeholder="R0.00"
                    value={newGigPrice}
                    onChange={(e) => setNewGigPrice(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-blue-200 font-bold"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleCreateGigSubmit}
              disabled={!newGigTitle || !newGigDescription || !newGigPrice}
              className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black shadow-xl shadow-slate-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all mt-auto"
            >
              Post Gig
            </button>
          </div>
        );
      case "detail":
        if (!selectedGig) return null;
        return (
          <div className="h-full flex flex-col overflow-y-auto no-scrollbar pb-10">
            {/* Hero Section - Edge to Edge */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 shadow-2xl">
              {selectedGig.images && selectedGig.images.length > 0 ? (
                <img src={selectedGig.images[0]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                  <Briefcase className="w-20 h-20 text-white/50" />
                </div>
              )}
              <div className="absolute top-16 right-6">
                <div className="bg-orange-500 text-white text-[11px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest shadow-2xl border-2 border-white/20 backdrop-blur-md">
                  {selectedGig.pay}
                </div>
              </div>
            </div>

            <div className="px-6 pt-8 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-wider">Marketplace Trending</span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider">Identity Verified</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9]">{selectedGig.title}</h2>
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span className="text-sm font-black text-slate-800">4.9 Star Rating</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-200">•</span>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">{selectedGig.location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Project Brief</p>
                <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 italic">
                  <p className="text-slate-600 leading-relaxed text-base">
                    "{selectedGig.description}"
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-1 bg-white rounded-[32px] border-2 border-slate-50 shadow-sm overflow-hidden">
                <div className="p-5 text-center space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Interactions</p>
                  <p className="text-base font-black text-slate-800">12 Active</p>
                </div>
                <div className="p-5 text-center space-y-1 bg-slate-50/50 border-x border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Submission</p>
                  <p className="text-base font-black text-slate-800">2d Left</p>
                </div>
                <div className="p-5 text-center space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Protection</p>
                  <p className="text-base font-black text-orange-600">Secure</p>
                </div>
              </div>

              {/* Action Section */}
              <div className="space-y-5 pb-10">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Interested in this task?</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAppStep("apply_text")}
                    className="bg-white border-2 border-slate-100 p-7 rounded-[40px] flex flex-col items-center gap-4 hover:border-orange-200 hover:bg-orange-50/30 transition-all shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Send Pitch</span>
                  </button>
                  <button 
                    onClick={() => { setAppStep("apply_video"); }}
                    className="bg-orange-600 p-7 rounded-[40px] flex flex-col items-center gap-4 hover:bg-orange-700 transition-all shadow-2xl shadow-orange-200 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2">
                       <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Video Intro</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "apply_text":
        return (
          <div className="space-y-6 h-full flex flex-col px-6 pt-20 pb-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter">I can do this!</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tell the poster why you're a good fit.</p>
            </div>
            <div className="flex-1">
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Type your reason here..."
                className="w-full h-48 bg-white border-2 border-slate-100 rounded-3xl p-6 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-blue-200 transition-colors resize-none shadow-sm"
              />
            </div>
            <button 
              disabled={!reason.trim()}
              onClick={handleSubmit}
              className={`w-full py-5 rounded-3xl flex items-center justify-center gap-3 font-bold text-white shadow-lg transition-all ${reason.trim() ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 translate-y-0' : 'bg-slate-300 translate-y-0 opacity-50 cursor-not-allowed'}`}
            >
              <Send className="w-5 h-5" />
              Submit Application
            </button>
          </div>
        );
      case "apply_video":
        return renderVideoRecordingView("Video Intro", "Record a quick 60s pitch.");
      case "success":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <motion.div 
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center">
                <span 
                  className="text-6xl font-black tracking-tighter uppercase"
                  style={{
                    color: "transparent",
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
                      repeating-linear-gradient(0deg, transparent, transparent 15px, #333 15px, #333 17px),
                      repeating-linear-gradient(90deg, #b22222, #b22222 20px, #333 20px, #333 22px)
                    `,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))"
                  }}
                >
                  TIME
                </span>
                <motion.div
                  style={{ display: "inline-block", transformOrigin: "top left" }}
                  initial={{ rotate: 20 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.2, type: "spring", stiffness: 300, damping: 10 }}
                  className="relative ml-2 bg-[#faca00] border-2 border-slate-800 rounded-md px-3 py-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.1 }}
                    className="absolute -top-1.5 left-2 w-3 h-3 rounded-full border border-slate-900 bg-slate-300 shadow-[inset_1px_1px_2px_black,0_0_2px_black] z-10" 
                  />
                  <div className="absolute -top-1.5 right-2 w-2 h-2 rounded-full border border-slate-800 bg-black/50 shadow-inner" />
                  <span className="font-mono text-3xl font-black text-slate-900 tracking-wider">
                    GIG
                  </span>
                </motion.div>
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-slate-800"
            >
              Congratulations!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 mt-4 max-w-[240px]"
            >
              {selectedGig ? (
                <>Your application for <span className="font-bold text-slate-800">"{selectedGig.title}"</span> has been sent successfully.</>
              ) : (
                <>Your new gig <span className="font-bold text-slate-800">"{newGigTitle}"</span> has been posted successfully.</>
              )}
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => { setAppStep("list"); setSelectedGig(null); resetNewGigForm(); }}
              className="mt-12 bg-slate-800 text-white px-10 py-4 rounded-3xl font-bold shadow-xl hover:bg-slate-900 transition-colors"
            >
              Keep Exploring
            </motion.button>
          </div>
        );
      default:
        return null;
    }
  };
  const renderSeekersView = () => {
    switch (appStep) {
      case "list":
        return (
          <div className="space-y-6 px-6 pt-20 pb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span 
                        className="text-3xl font-black tracking-tighter uppercase"
                        style={{
                          color: "transparent",
                          backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
                            repeating-linear-gradient(0deg, transparent, transparent 9px, #333 9px, #333 10px),
                            repeating-linear-gradient(90deg, #b22222, #b22222 12px, #333 12px, #333 13px)
                          `,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.5))"
                        }}
                      >
                        TIME
                      </span>
                      <motion.div
                        style={{ display: "inline-block", transformOrigin: "top left" }}
                        animate={{ rotate: [20, 28, 18, 24, 20] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="relative ml-1 bg-[#faca00] border border-slate-800 rounded px-1.5 py-0 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                      >
                        <div className="absolute -top-0.5 left-1 w-1 h-1 rounded-full border border-slate-800 bg-slate-700 shadow-inner" />
                        <div className="absolute -top-0.5 right-1 w-1 h-1 rounded-full border border-slate-800 bg-black/50 shadow-inner" />
                        <span className="font-mono text-sm font-black text-slate-900 tracking-wider">
                          GIG
                        </span>
                      </motion.div>
                    </div>
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                      Sellers
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top Rated Local Stores & Freelancers</p>
                </div>
                <button 
                  onClick={() => setAppStep("seeker_signup")}
                  className="px-4 py-2 bg-[#3665f3] hover:bg-[#2051d9] text-white rounded-xl text-[10.5px] font-black shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  JOIN AS SELLER
                </button>
              </div>

              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search seller tags or skills..." 
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-l-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-[46px]"
                  />
                </div>
                <button className="bg-[#3665f3] hover:bg-[#2051d9] text-white px-5 rounded-r-xl font-bold uppercase text-[10px] tracking-wider transition-colors h-[46px] shrink-0 active:scale-95">
                  Search
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100">
                {["All", "Handyman", "Cleaning", "Technical", "Creative"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSeekersCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-[10px] font-bold transition-all ${seekersCategory === cat ? 'bg-[#3665f3] text-white border-[#3665f3] shadow-sm' : 'bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-24">
              {allSeekers.filter(s => seekersCategory === "All" || s.category === seekersCategory).map((seeker) => {
                const numericPay = 200;
                const wasPayVal = Math.round(numericPay * 1.55);
                const wasPay = `R${wasPayVal}/hr`;
                const offPercent = 35; // ~35% rate boost / bonus
                
                return (
                  <motion.div 
                    key={seeker.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleViewSeekerProfile(seeker)}
                    className="bg-white rounded-2xl border border-slate-100 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all overflow-hidden flex flex-col group relative text-left"
                  >
                    <div className="absolute top-2 left-2 z-10 bg-[#ff5500] text-white text-[9.5px] font-black px-2 py-0.5 rounded-md tracking-tight flex items-center gap-0.5 uppercase shadow-sm">
                      <span>-{offPercent}%</span>
                      <span className="opacity-80">Boosted</span>
                    </div>

                    <div className="aspect-square bg-slate-50 relative overflow-hidden">
                      {seeker.avatar ? (
                        <img src={seeker.avatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50/20 to-slate-100">
                          <User className="w-10 h-10 text-orange-200" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-xs py-1.5 px-2.5 text-white text-[8.5px] font-black tracking-widest uppercase flex items-center justify-between">
                        <span className="text-[#ff9900]">⏳ LIGHTNING BOOKING</span>
                        <span>{Math.floor(Math.random() * 3) + 1} SPOTS LEFT</span>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-semibold text-slate-800 text-[13px] sm:text-[14px] leading-snug line-clamp-2 min-h-[2.8rem] group-hover:text-[#ff5500]">
                          {seeker.name}
                        </h3>
                        
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-xs">
                          <div className="flex items-center text-[#ff9900] font-extrabold gap-0.5">
                            <Star className="w-3 h-3 fill-[#ff9900] stroke-none shrink-0" />
                            <span className="text-[11px]">4.9</span>
                          </div>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500 line-clamp-1">{seeker.category}</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 flex flex-col gap-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg sm:text-[22px] font-extrabold text-[#ff5500] leading-none tracking-tight">
                            R{numericPay}/hr
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold line-through decoration-slate-300">
                            {wasPay}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5">
                          <span className="text-[#ff5500]">Top Rated</span>
                          {seeker.isVerified && (
                            <span className="flex items-center gap-0.5 text-emerald-600">
                              <span className="w-2.5 h-3 rounded-[2px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                <span className="text-[6px] text-white">🇿🇦</span>
                              </span>
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px]">🔥</span>
                          <span className="text-[9.5px] font-bold text-slate-500 tracking-wide">{Math.floor(Math.random() * 500 + 50)} employers viewed today</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      case "profile_detail":
        if (!selectedSeeker) return null;
        return renderProfileDetail(selectedSeeker);
      case "seeker_signup":
        return (
          <div className="space-y-6 flex flex-col h-full overflow-hidden px-6 pt-20 pb-10">
            <div className="flex flex-col gap-2 pr-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tighter">Become a Seeker</h2>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 self-start shadow-sm shadow-emerald-50">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">No ID Verification Needed</span>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pb-4 pr-1">
              {/* Profile Pic */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div 
                  onClick={() => seekerAvatarRef.current?.click()}
                  className={`w-32 h-32 rounded-full border-4 border-white shadow-lg bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden relative group ${!seekerAvatar ? 'ring-2 ring-purple-100 ring-offset-2' : ''}`}
                >
                  {seekerAvatar ? (
                    <img src={seekerAvatar} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-bold">{seekerAvatar ? 'CHANGE' : 'ADD PHOTO'}</span>
                  </div>
                </div>
                <input type="file" ref={seekerAvatarRef} accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Picture</p>
                  {!seekerAvatar && <p className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Required</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Full Name</p>
                  <input 
                    type="text"
                    placeholder="Enter your name..."
                    value={seekerName}
                    onChange={(e) => setSeekerName(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-purple-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Email</p>
                    <input 
                      type="email"
                      placeholder="Email Address"
                      value={seekerEmail}
                      onChange={(e) => setSeekerEmail(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 text-sm focus:border-purple-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Phone</p>
                    <input 
                      type="text"
                      placeholder="Phone Number"
                      value={seekerPhone}
                      onChange={(e) => setSeekerPhone(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 text-sm focus:border-purple-200"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Category</p>
                    <select 
                      value={seekerCategory}
                      onChange={(e) => setSeekerCategory(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 text-sm focus:border-purple-200 font-medium"
                    >
                      <option>General</option>
                      <option>Handyman</option>
                      <option>Cleaning</option>
                      <option>Technical</option>
                      <option>Creative</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Education</p>
                    <input 
                      type="text"
                      placeholder="e.g. Diploma"
                      value={seekerEducation}
                      onChange={(e) => setSeekerEducation(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-purple-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Professional Bio</p>
                  <textarea 
                    placeholder="Describe yourself in a few sentences..."
                    value={seekerBio}
                    onChange={(e) => setSeekerBio(e.target.value)}
                    className="w-full h-24 bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-purple-200 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Work Experiences</p>
                  <textarea 
                    placeholder="Recent roles and achievements..."
                    value={seekerExperience}
                    onChange={(e) => setSeekerExperience(e.target.value)}
                    className="w-full h-32 bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-purple-200 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Skills (Comma separated)</p>
                  <input 
                    type="text"
                    placeholder="Plumbing, Carpentry, Excel..."
                    value={seekerSkills}
                    onChange={(e) => setSeekerSkills(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-purple-200"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Motivational Letter</p>
                  <textarea 
                    placeholder="Why should users hire you?"
                    value={seekerLetter}
                    onChange={(e) => setSeekerLetter(e.target.value)}
                    className="w-full h-48 bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-purple-200 resize-none font-medium"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSeekerSubmit}
              disabled={!seekerName || !seekerBio || !seekerLetter || !seekerAvatar || !seekerEmail || !seekerPhone}
              className="w-full bg-purple-600 text-white py-5 rounded-[32px] font-black shadow-xl shadow-purple-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all mt-auto shrink-0"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        );
    case "seeker_docs":
        return (
          <div className="space-y-8 h-full flex flex-col overflow-hidden px-6 pt-20 pb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">Identity Check</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID document verification</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-100 rounded-[40px] p-12 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:border-purple-200 transition-colors bg-slate-50/50"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-700">Drop ID documents</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Requires front & back</p>
                </div>
                <input type="file" ref={fileInputRef} multiple onChange={handleSeekerDocsChange} className="hidden" />
              </div>

              {seekerDocs.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{seekerDocs.length} Documents Selected</p>
                  <div className="grid grid-cols-4 gap-3">
                    {seekerDocs.map((doc, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                        <img src={doc} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={startScanningSeekerDocs}
              disabled={seekerDocs.length < 2}
              className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-30"
            >
              <RefreshCw className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
              Verify Identity
            </button>
          </div>
        );
      case "seeker_video":
        return renderVideoRecordingView("Profile Mirror", "Record your professional intro.");
      case "seeker_scanning":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-12">
            <div className="w-full max-w-[280px] aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-[48px]" />
              <motion.div className="absolute inset-0 bg-slate-50 flex items-center justify-center overflow-hidden rounded-[48px]">
                {seekerDocs[0] && <img src={seekerDocs[0]} className="w-full h-full object-cover opacity-20 grayscale" />}
                <motion.div 
                  className="absolute inset-x-0 h-1 bg-purple-500 shadow-[0_0_20px_purple]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <div className="absolute -bottom-6 w-full px-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <motion.div className="h-full bg-purple-500" initial={{ width: 0 }} animate={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {scanResult === "pending" ? (
                <>
                  <h2 className="text-2xl font-black text-slate-800">Verifying Seeker...</h2>
                  <p className="text-slate-400 text-sm font-medium">Validating biographical information and ID validity.</p>
                </>
              ) : scanResult === "success" ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800">Identity Verified!</h2>
                   <p className="text-slate-500 text-sm font-medium">Your seeker profile has been approved. You are now a verified talent on the platform.</p>
                   <button 
                     onClick={() => setAppStep("seeker_video")}
                     className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black shadow-xl"
                   >
                     Record Video Intro
                   </button>
                </motion.div>
              ) : (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                   <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-10 h-10 text-red-500" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800">Verification Failed</h2>
                   <p className="text-slate-500 text-sm font-medium">The uploaded documents do not match our security requirements.</p>
                   <button onClick={() => setAppStep("seeker_docs")} className="bg-slate-100 text-slate-800 px-10 py-5 rounded-[24px] font-black">
                     Try Again
                   </button>
                </motion.div>
              )}
            </div>
          </div>
        );
      case "seeker_confirm":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 pt-20 pb-10">
             <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-50">
               <Search className="w-10 h-10 text-purple-600" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">Ready to be featured?</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 max-w-[280px] leading-relaxed">
               Do you want to appear in the Seekers Directory?
             </p>
             
             <div className="mt-12 w-full space-y-4">
                <button 
                  onClick={() => handleConfirmSeeker(true)}
                  className="w-full bg-purple-600 text-white py-5 rounded-[32px] font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all"
                >
                  Yes, Feature Me!
                </button>
                <button 
                  onClick={() => handleConfirmSeeker(false)}
                  className="w-full bg-white border-2 border-slate-100 text-slate-400 py-5 rounded-[32px] font-bold hover:bg-slate-50 transition-all font-mono text-[10px] tracking-widest uppercase"
                >
                  No, Skip for Now
                </button>
             </div>
          </div>
        );
      case "apply_video":
        return renderVideoRecordingView("Video Intro", "Update your professional profile.");
      case "success":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <motion.div 
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center">
                <span 
                  className="text-6xl font-black tracking-tighter uppercase"
                  style={{
                    color: "transparent",
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
                      repeating-linear-gradient(0deg, transparent, transparent 15px, #333 15px, #333 17px),
                      repeating-linear-gradient(90deg, #b22222, #b22222 20px, #333 20px, #333 22px)
                    `,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))"
                  }}
                >
                  TIME
                </span>
                <motion.div
                  style={{ display: "inline-block", transformOrigin: "top left" }}
                  initial={{ rotate: 20 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.2, type: "spring", stiffness: 300, damping: 10 }}
                  className="relative ml-2 bg-[#faca00] border-2 border-slate-800 rounded-md px-3 py-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.1 }}
                    className="absolute -top-1.5 left-2 w-3 h-3 rounded-full border border-slate-900 bg-slate-300 shadow-[inset_1px_1px_2px_black,0_0_2px_black] z-10" 
                  />
                  <div className="absolute -top-1.5 right-2 w-2 h-2 rounded-full border border-slate-800 bg-black/50 shadow-inner" />
                  <span className="font-mono text-3xl font-black text-slate-900 tracking-wider">
                    GIG
                  </span>
                </motion.div>
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-slate-800"
            >
              Congratulations!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 mt-4 max-w-[240px]"
            >
              Your professional seeker profile has been minted. You're now live in the directory.
            </motion.p>
            
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mt-4 max-w-[280px]">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">🪙 Coins Awarded!</span>
              <p className="text-xs text-emerald-600 mt-1">
                You received {acceptedShare ? "25" : "10"} coins ({acceptedShare ? "10 Welcome + 15 Share" : "10 Welcome"}) in your wallet!
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 w-full max-w-[300px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Share on Socials</p>
              <div className="flex justify-center gap-3">
                {[
                  { name: "Twitter / X", icon: <Globe className="w-4 h-4 text-white" />, color: "bg-slate-900 border border-slate-800 hover:bg-slate-850" },
                  { name: "WhatsApp", icon: <MessageSquare className="w-4 h-4 text-white" />, color: "bg-emerald-600 hover:bg-emerald-600/90" },
                  { name: "Facebook", icon: <Share2 className="w-4 h-4 text-white" />, color: "bg-blue-600 hover:bg-blue-600/90" },
                  { name: "Copy Link", icon: <CheckCircle className="w-4 h-4 text-white" />, color: "bg-indigo-600 hover:bg-indigo-600/90" }
                ].map(platform => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      handleOpenShareLink(platform.name);
                      if (platform.name === "Copy Link") {
                        alert("App link copied to clipboard successfully!");
                      }
                    }}
                    title={platform.name}
                    className={`p-3.5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 text-white shadow-md hover:scale-105 ${platform.color}`}
                  >
                    {platform.icon}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => { 
                setActiveView("Gigs");
                setAppStep("list"); 
                resetSeekerForm(); 
              }}
              className="mt-6 bg-indigo-600 text-white px-10 py-4 rounded-3xl font-bold shadow-xl hover:bg-indigo-700 transition-colors"
            >
              Proceed to Gigs Feature →
            </motion.button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderBusinessView = () => {
    switch (appStep) {
      case "list":
        return (
          <div className="space-y-6 px-6 pt-20 pb-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Businesses</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Partners</p>
                </div>
                <button 
                  onClick={() => setAppStep("business_signup")}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-full text-xs font-black shadow-xl flex items-center gap-2 hover:bg-orange-700 scale-105 active:scale-95 transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  POST AS BIZ
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search industries..." 
                  className="w-full bg-slate-100/50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-20">
              {allBusinesses.map((biz) => (
                <motion.div 
                  key={biz.id}
                  whileHover={{ y: -4 }}
                  onClick={() => handleViewBusinessProfile(biz)}
                  className="bg-white rounded-[24px] border border-slate-50 shadow-sm cursor-pointer hover:shadow-xl transition-all overflow-hidden flex flex-col group"
                >
                  <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden">
                    {biz.logo ? (
                      <img src={biz.logo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                        <Briefcase className="w-12 h-12 text-orange-200" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg">
                        Partner
                      </div>
                    </div>
                    {biz.isVerified && (
                      <div className="absolute bottom-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter shadow-lg flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        CERTIFIED
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-800 text-xs leading-tight line-clamp-1">{biz.name}</h3>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate">{biz.industry}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight truncate">{biz.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between pt-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-300 uppercase leading-none">Trust Score</span>
                        <div className="flex items-center gap-1">
                           <Star className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />
                           <p className="font-black text-slate-800 text-xs leading-none">High</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case "profile_detail":
        if (!selectedBusiness) return null;
        return renderProfileDetail(selectedBusiness);
      case "business_signup":
        return (
          <div className="space-y-6 flex flex-col h-full overflow-hidden px-6 pt-20 pb-10">
            <div className="flex flex-col gap-1 pr-1">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Business Registration</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">Onboard your company</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pb-4 pr-1">
              {/* Business Logo */}
              <div className="flex flex-col items-center gap-3 py-4">
                <div 
                  onClick={() => bizLogoRef.current?.click()}
                  className={`w-32 h-32 rounded-3xl border-4 border-white shadow-lg bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden relative group ${!bizLogo ? 'ring-2 ring-orange-100 ring-offset-2' : ''}`}
                >
                  {bizLogo ? (
                    <img src={bizLogo} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-bold uppercase">Upload Logo</span>
                  </div>
                </div>
                <input type="file" ref={bizLogoRef} accept="image/*" onChange={handleBizLogoChange} className="hidden" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Logo</p>
                  {!bizLogo && <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Required</p>}
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Business Name</p>
                  <input 
                    type="text"
                    placeholder="Enter business name..."
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-orange-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Email</p>
                    <input 
                      type="email"
                      placeholder="Business Email"
                      value={bizEmail}
                      onChange={(e) => setBizEmail(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 text-sm focus:border-orange-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Phone</p>
                    <input 
                      type="text"
                      placeholder="Business Phone"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 text-sm focus:border-orange-200"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Industry</p>
                    <select 
                      value={bizIndustry}
                      onChange={(e) => setBizIndustry(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 text-sm focus:border-orange-200 font-medium"
                    >
                      <option>General</option>
                      <option>Construction</option>
                      <option>Retail</option>
                      <option>Technology</option>
                      <option>Services</option>
                      <option>Consulting</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Headquarters</p>
                    <input 
                      type="text"
                      placeholder="e.g. Cape Town"
                      value={bizLocation}
                      onChange={(e) => setBizLocation(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-orange-200 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">About Company</p>
                  <textarea 
                    placeholder="What does your company do?..."
                    value={bizDesc}
                    onChange={(e) => setBizDesc(e.target.value)}
                    className="w-full h-32 bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-700 placeholder:text-slate-300 text-sm focus:border-orange-200 resize-none font-medium"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleBusinessSubmit}
              disabled={!bizName || !bizDesc || !bizLocation || !bizEmail || !bizPhone || !bizLogo}
              className="w-full bg-orange-600 text-white py-5 rounded-[32px] font-black shadow-xl shadow-orange-100 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all mt-auto shrink-0"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        );
      case "business_docs":
        return (
          <div className="space-y-8 h-full flex flex-col overflow-hidden">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Identity Check</h2>
              <p className="text-slate-500 text-sm">Upload CIPC or identity documents for verification.</p>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-100 rounded-[40px] p-12 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:border-orange-200 transition-colors bg-slate-50/50"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-orange-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-700">Drop files or click to upload</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports PDF, PNG, JPG</p>
                </div>
                <input type="file" ref={fileInputRef} multiple onChange={handleBizDocsChange} className="hidden" />
              </div>

              {bizDocs.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{bizDocs.length} Documents Selected</p>
                  <div className="grid grid-cols-4 gap-3">
                    {bizDocs.map((doc, i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                        <img src={doc} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={startScanningDocs}
              disabled={bizDocs.length < 2}
              className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-30"
            >
              <RefreshCw className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
              Confirm & Verify
            </button>
          </div>
        );
      case "business_scanning":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-12">
            <div className="w-full max-w-[280px] aspect-square relative flex items-center justify-center">
              {/* Modern Scanner Animation */}
              <div className="absolute inset-0 border-4 border-slate-100 rounded-[48px]" />
              <motion.div 
                className="absolute inset-0 bg-slate-50 flex items-center justify-center overflow-hidden rounded-[48px]"
              >
                {bizDocs[0] && <img src={bizDocs[0]} className="w-full h-full object-cover opacity-20 grayscale" />}
                <motion.div 
                  className="absolute inset-x-0 h-1 bg-orange-500 shadow-[0_0_20px_orange]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <div className="absolute -bottom-6 w-full px-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <motion.div 
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${scanProgress}%` }}
                   />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {scanResult === "pending" ? (
                <>
                  <h2 className="text-2xl font-black text-slate-800">Scanning Documents...</h2>
                  <p className="text-slate-400 text-sm font-medium">Validating security watermarks and CIPC records.</p>
                </>
              ) : scanResult === "success" ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800">Verification Approved!</h2>
                   <p className="text-slate-500 text-sm font-medium">Your business is now fully verified. You can now post gigs and engage with seekers.</p>
                   <button 
                     onClick={() => setAppStep("success")}
                     className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black shadow-xl"
                   >
                     Finish Setup
                   </button>
                </motion.div>
              ) : (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                   <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-10 h-10 text-red-500" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800">Verification Declined</h2>
                   <p className="text-slate-500 text-sm font-medium">Documents were unclear or invalid. Please ensure all 2 required forms are clear and legible.</p>
                   <button 
                     onClick={() => setAppStep("business_docs")}
                     className="bg-slate-100 text-slate-800 px-10 py-5 rounded-[24px] font-black"
                   >
                     Try Again
                   </button>
                </motion.div>
              )}
            </div>
          </div>
        );
      case "success":
        return (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <motion.div 
              className="flex items-center justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center">
                <span 
                  className="text-6xl font-black tracking-tighter uppercase"
                  style={{
                    color: "transparent",
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
                      repeating-linear-gradient(0deg, transparent, transparent 15px, #333 15px, #333 17px),
                      repeating-linear-gradient(90deg, #b22222, #b22222 20px, #333 20px, #333 22px)
                    `,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))"
                  }}
                >
                  TIME
                </span>
                <motion.div
                  style={{ display: "inline-block", transformOrigin: "top left" }}
                  initial={{ rotate: 20 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.2, type: "spring", stiffness: 300, damping: 10 }}
                  className="relative ml-2 bg-[#faca00] border-2 border-slate-800 rounded-md px-3 py-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.1 }}
                    className="absolute -top-1.5 left-2 w-3 h-3 rounded-full border border-slate-900 bg-slate-300 shadow-[inset_1px_1px_2px_black,0_0_2px_black] z-10" 
                  />
                  <div className="absolute -top-1.5 right-2 w-2 h-2 rounded-full border border-slate-800 bg-black/50 shadow-inner" />
                  <span className="font-mono text-3xl font-black text-slate-900 tracking-wider">
                    GIG
                  </span>
                </motion.div>
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-slate-800"
            >
              Congratulations!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 mt-4 max-w-[240px]"
            >
              Your corporate business profile has been minted successfully. <span className="font-bold text-slate-800">"{bizName}"</span> is now part of the corporate network directory.
            </motion.p>
            
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 mt-4 max-w-[280px]">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">🪙 Coins Awarded!</span>
              <p className="text-xs text-emerald-600 mt-1">
                You received {acceptedShare ? "25" : "10"} coins ({acceptedShare ? "10 Welcome + 15 Share" : "10 Welcome"}) in your wallet!
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 w-full max-w-[300px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Share on Socials</p>
              <div className="flex justify-center gap-3">
                {[
                  { name: "Twitter / X", icon: <Globe className="w-4 h-4 text-white" />, color: "bg-slate-900 border border-slate-800 hover:bg-slate-850" },
                  { name: "WhatsApp", icon: <MessageSquare className="w-4 h-4 text-white" />, color: "bg-emerald-600 hover:bg-emerald-600/90" },
                  { name: "Facebook", icon: <Share2 className="w-4 h-4 text-white" />, color: "bg-blue-600 hover:bg-blue-600/90" },
                  { name: "Copy Link", icon: <CheckCircle className="w-4 h-4 text-white" />, color: "bg-indigo-600 hover:bg-indigo-600/90" }
                ].map(platform => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      handleOpenShareLink(platform.name);
                      if (platform.name === "Copy Link") {
                        alert("App link copied to clipboard successfully!");
                      }
                    }}
                    title={platform.name}
                    className={`p-3.5 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 text-white shadow-md hover:scale-105 ${platform.color}`}
                  >
                    {platform.icon}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => { 
                setActiveView("Gigs");
                setAppStep("list"); 
                resetBusinessForm(); 
              }}
              className="mt-6 bg-indigo-600 text-white px-10 py-4 rounded-3xl font-bold shadow-xl hover:bg-indigo-700 transition-colors"
            >
              Proceed to Gigs Feature →
            </motion.button>
          </div>
        );
      default:
        return null;
    }
  };

  const handleToggleAccount = () => {
    setIsAccountDisabled(!isAccountDisabled);
  };

  const renderWalletView = () => {
    if (appStep === "wallet_payment_upload" && selectedPackage) {
      return (
        <div className="space-y-6 px-6 pt-20 pb-10 h-screen overflow-y-auto">
          <h2 className="text-2xl font-black text-slate-800">Complete Payment</h2>
          <div className="bg-slate-50 rounded-[24px] p-6 space-y-4 border border-slate-100">
             <h3 className="font-black text-slate-900 text-sm">Payment Bank Transfer</h3>
             <div className="text-xs space-y-2">
               <p><span className="font-bold">Bank:</span> Capitec</p>
               <p><span className="font-bold">Account Name:</span> Matthews</p>
               <p><span className="font-bold">Account Number:</span> 1334067366</p>
               <p><span className="font-bold">Ref:</span> Option {selectedPackage}c</p>
             </div>
          </div>

          <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Proof of Payment</label>
              <input 
                  type="file" 
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              />
          </div>
          
          <button 
              onClick={() => {
                  if (!proofFile) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      setTransactions(prev => [{
                        id: Date.now(),
                        type: "topup",
                        amount: 0,
                        desc: `Pending: ${selectedPackage} Coins`,
                        date: "Pending Review",
                        proof: reader.result as string,
                        status: "pending",
                        coinAmount: selectedPackage
                      }, ...prev]);
                      setAppStep("list");
                      setSelectedPackage(null);
                      setProofFile(null);
                      setShowSentMessage(true);
                      setTimeout(() => setShowSentMessage(false), 3000);
                  };
                  reader.readAsDataURL(proofFile);
              }}
              disabled={!proofFile}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs disabled:opacity-50"
          >
              Submit Proof
          </button>
          
          <button onClick={() => { setSelectedPackage(null); setAppStep("wallet_topup"); }} className="w-full bg-slate-200 text-slate-800 py-4 rounded-2xl font-black text-xs">Cancel</button>
        </div>
      );
    }

    if (appStep === "wallet_topup") {
      const packages = [
        { label: "10 DAYS", items: [
            { coins: 15, price: 5.00 },
            { coins: 35, price: 10.99 },
            { coins: 80, price: 19.99 },
        ]},
        { label: "30 DAYS", items: [
            { coins: 150, price: 25.99 },
            { coins: 350, price: 45.99 },
            { coins: 800, price: 99.99 },
        ]}
      ];

      return (
        <div className="space-y-6 px-6 pt-20 pb-10">
          <h2 className="text-2xl font-black text-slate-800">Buy Coins</h2>
          {packages.map(p => (
            <div key={p.label} className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.label}</p>
              <div className="grid grid-cols-3 gap-2">
                {p.items.map(item => (
                    <button 
                        key={item.coins} 
                        onClick={() => { setSelectedPackage(item.coins); setAppStep("wallet_payment_upload"); }}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-center hover:border-emerald-200 transition-all">
                        <p className="font-black text-sm">{item.coins}c</p>
                        <p className="text-emerald-600 text-xs font-bold">R{item.price.toFixed(2)}</p>
                    </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => { setSelectedPackage(null); setAppStep("list"); }} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs">Back</button>
        </div>
      );
    }

    return (
      <div className="space-y-6 px-6 pt-20 pb-10">
        <div className="p-8 rounded-[40px] bg-slate-50 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl font-black text-slate-800">Wallet</h2>
            <p className="text-4xl font-black text-indigo-600 tracking-tight">{balance.toLocaleString()}c</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setAppStep("wallet_topup")}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
              >
                Top Up
              </button>
            </div>
            <div className="mt-6">
              <button 
                onClick={handleToggleAccount}
                className={`w-full py-3 rounded-2xl font-bold text-sm border ${isAccountDisabled ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'} text-white shadow-lg active:scale-95 transition-transform`}
              >
                {isAccountDisabled ? "Enable Account" : "Disable Account"}
              </button>
            </div>
            <div className="mt-3">
              <button 
                onClick={() => setWalletSoundsEnabled(!walletSoundsEnabled)}
                className={`w-full py-3 rounded-2xl font-bold text-sm border bg-slate-200 border-slate-300 text-slate-700 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2`}
              >
                {walletSoundsEnabled ? "🔊 Sound Effects: ON" : "🔇 Sound Effects: OFF"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Social Sharing & Referral Rewards Hub */}
        <div className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl relative overflow-hidden border border-indigo-500/25">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400 stroke-[2.5px]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">Social Sharing Hub</h3>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-extrabold tracking-tight">Refer & Share on Socials</h4>
              <p className="text-[10px] text-slate-400 font-medium">
                Broadcast the link on social channels to receive <span className="font-bold text-emerald-400">+15 coins</span> immediately!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { name: "Twitter / X", icon: <Globe className="w-3.5 h-3.5" />, color: "bg-slate-800 hover:bg-slate-700 hover:text-orange-400" },
                { name: "WhatsApp", icon: <MessageSquare className="w-3.5 h-3.5" />, color: "bg-emerald-800 hover:bg-emerald-700 hover:text-emerald-300" },
                { name: "Facebook", icon: <Share2 className="w-3.5 h-3.5" />, color: "bg-blue-900 hover:bg-blue-800 hover:text-blue-300" },
                { name: "Copy Link", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "bg-indigo-900 hover:bg-indigo-850 hover:text-indigo-200" }
              ].map(platform => (
                <button
                  key={platform.name}
                  onClick={() => {
                    const awardCoins = 15;
                    setBalance(prev => prev + awardCoins);
                    
                    const newTx: Transaction = {
                      id: Date.now(),
                      type: "received",
                      amount: awardCoins,
                      desc: `Social Sharing: ${platform.name}`,
                      date: new Date().toLocaleDateString()
                    };
                    setTransactions(prev => [newTx, ...prev]);

                    const newAlert = {
                      id: Date.now() + Math.random(),
                      sender: "Social Rewards Portal",
                      text: `Shared Successfully! You earned a +15 coins reward immediately for sharing the link via ${platform.name}.`,
                      time: "Just now",
                      unread: true,
                      type: "wallet" as const
                    };
                    setNotificationAlerts(prev => [newAlert, ...prev]);
                    
                    // Trigger actual link redirection/open
                    handleOpenShareLink(platform.name);
                    
                    alert(`Awesome! You shared the app on ${platform.name} and earned 15 coins immediately!`);
                  }}
                  className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700/50 transition-all active:scale-95 ${platform.color}`}
                >
                  {platform.icon}
                  {platform.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Activity Log</h3>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-slate-800">{tx.desc}</p>
                  <p className="text-[10px] text-slate-400">{tx.date}</p>
                </div>
                <p className={`font-black ${tx.type === 'received' || tx.type === 'topup' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'received' || tx.type === 'topup' ? '+' : '-'} {tx.amount.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const [inboxFilter, setInboxFilter] = useState<"all" | "views" | "updates">("all");

  const renderInboxView = () => {
    const getAlertIcon = (type: string) => {
      switch(type) {
        case "view": return <Eye className="w-4 h-4 text-sky-500" />;
        case "document": return <Lock className="w-4 h-4 text-indigo-500" />;
        case "gig": return <Briefcase className="w-4 h-4 text-orange-500" />;
        case "seeker": return <User className="w-4 h-4 text-purple-500" />;
        case "wallet": return <Award className="w-4 h-4 text-emerald-500" />;
        default: return <Bell className="w-4 h-4 text-slate-500" />;
      }
    };

    const getAlertBadgeColor = (type: string) => {
      switch(type) {
        case "view": return "bg-sky-50 text-sky-700 border-sky-100";
        case "document": return "bg-indigo-50 text-indigo-700 border-indigo-100";
        case "gig": return "bg-orange-50 text-orange-700 border-orange-100";
        case "seeker": return "bg-purple-50 text-purple-700 border-purple-100";
        case "wallet": return "bg-emerald-50 text-emerald-700 border-emerald-100";
        default: return "bg-slate-50 text-slate-700 border-slate-100";
      }
    };

    const getAlertLabelName = (type: string) => {
      switch(type) {
        case "view": return "Profile View";
        case "document": return "Document Lock";
        case "gig": return "Latest Gig Alert";
        case "seeker": return "New Candidate";
        case "wallet": return "Loyalty Coin";
        default: return "System Alert";
      }
    };

    // Filter local notifications
    const filteredAlerts = notificationAlerts.filter(alert => {
      if (inboxFilter === "views") return alert.type === "view" || alert.type === "document";
      if (inboxFilter === "updates") return alert.type === "gig" || alert.type === "seeker";
      return true;
    });

    const handleMarkAllRead = () => {
      setNotificationAlerts(prev => prev.map(a => ({ ...a, unread: false })));
    };

    const handleClearAllAlerts = () => {
      setNotificationAlerts([]);
    };

    const handleAlertClick = (alert: any) => {
      // Mark as read
      setNotificationAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, unread: false } : a));
      
      // Auto routing based on notification type
      if (alert.type === "gig") {
        setActiveView("Gigs");
      } else if (alert.type === "seeker") {
        setActiveView("Seekers");
      } else if (alert.type === "view" || alert.type === "document") {
        setActiveView("Seekers");
        if (currentUserProfile) {
          setSelectedSeeker(currentUserProfile);
          setAppStep("profile_detail");
        }
      }
    };

    return (
      <div className="space-y-6 h-full flex flex-col px-6 pt-20 pb-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Inbox & Alerts</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Feed of Profile Views & Gigs</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[9px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors pointer-events-auto"
            >
              Read All
            </button>
            <button 
              onClick={handleClearAllAlerts}
              className="px-3 py-1.5 bg-red-50 border border-red-200/60 rounded-xl text-[9px] font-bold text-red-500 uppercase tracking-wider hover:bg-red-100 transition-colors pointer-events-auto"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 pb-3">
          {[
            { id: "all", label: "📬 All Feed" },
            { id: "views", label: "👁️ Seeker & ID Views" },
            { id: "updates", label: "💼 Gigs & New Seekers" }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setInboxFilter(opt.id as any)}
              className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                inboxFilter === opt.id 
                  ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                  : "bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-250"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3.5 pb-20 overflow-y-auto no-scrollbar flex-1 w-full">
          {/* Active Job applications review */}
          {applications.filter(a => a.status === "pending").map((app) => (
            <motion.div 
              key={`app-${app.id}`}
              whileHover={{ x: 2 }}
              onClick={() => { setSelectedApplication(app); setAppStep("view_application"); }}
              className="w-full rounded-2xl border border-orange-100 p-4 cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-4 bg-gradient-to-r from-orange-50/10 to-white text-left"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800 truncate mb-0.5">{app.seeker.name}</p>
                    <span className="text-[8px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest leading-none">Pending Applicant</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Applied for: {app.gigTitle || `Gig ID: ${app.gigId}`}. Check candidate credentials.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </motion.div>
          ))}

          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((msg) => (
              <motion.div 
                key={msg.id}
                whileHover={{ x: 2 }}
                onClick={() => handleAlertClick(msg)}
                className={`w-full rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-4 text-left relative ${msg.unread ? 'bg-indigo-50/20 border-indigo-150 shadow-sm' : 'bg-white border-slate-100'}`}
              >
                {msg.unread && (
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-orange-600 rounded-full shadow" />
                )}
                
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                    {getAlertIcon(msg.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-black text-slate-850 truncate leading-none">{msg.sender}</p>
                      <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${getAlertBadgeColor(msg.type)}`}>
                        {getAlertLabelName(msg.type)}
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium leading-none">{msg.time}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-relaxed font-semibold mt-1">
                      {msg.text}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest hidden sm:inline-block">
                    {msg.type === "gig" ? "View Gigs Board" : msg.type === "seeker" ? "Browse Talent" : "Acknowledge"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="w-full py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
               <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                 <Bell className="w-5 h-5 text-slate-300" />
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">No Alerts matching criteria</p>
            </div>
          )}
          
          <div className="w-full py-10 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center border border-slate-100 shadow-inner">
               <Mailbox className="w-6 h-6 text-slate-300" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Onboarding Alert Thread</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSecurityAndIdSection = (seeker: Seeker) => {
    const isOwner = currentUserProfile?.id === seeker.id;
    const access = checkIdAccess(seeker);
    const hasDocs = seeker.idDocuments && seeker.idDocuments.length > 0;
    
    return (
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[40px] p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden space-y-6 text-left">
        {/* Glow Element */}
        <div className="absolute right-0 top-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-indigo-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400 stroke-[2.5px]" />
              Seeker Privacy Guard
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
              Biographical Security & Asset Lockdown
            </p>
          </div>
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-[8.5px] font-black uppercase tracking-widest leading-none shrink-0">
            Active Security
          </span>
        </div>

        {isOwner ? (
          // OWNER CONTROLS PANEL
          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block leading-none">
                Who can view your uploaded ID?
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "none", label: "🔒 Private", desc: "Only Me" },
                  { key: "gigs", label: "👥 Gigs Only", desc: "My job hiring" },
                  { key: "verified", label: "🛡️ Verified Biz", desc: "Corporate only" },
                  { key: "all", label: "🌐 Anyone", desc: "Public view" }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleUpdateIdPrivacy(seeker.id, opt.key as any)}
                    className={`p-3 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                      seeker.shareIdOption === opt.key
                        ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-900/40 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-black leading-none">{opt.label}</span>
                    <span className="text-[8px] font-bold uppercase tracking-tight text-slate-400 mt-1 leading-none">{opt.desc}</span>
                  </button>
                ))}
              </div>
              <div className="text-[9px] text-slate-400 leading-relaxed pt-1 flex items-start gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-indigo-300 shrink-0 mt-0.5" />
                <span>
                  By law, hiring entities must confirm your credentials. The platform secures your assets from screenshotting and third-party caching.
                </span>
              </div>
            </div>

            {/* Document Status */}
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block leading-none">
                Your Uploaded ID Documents
              </span>
              {hasDocs ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {seeker.idDocuments?.map((doc, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          logIdView(seeker.id);
                          setSecureIdDocs([doc]);
                          setSecureIdOwnerName(seeker.name);
                        }}
                        className="aspect-square rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden relative cursor-zoom-in group"
                      >
                        <img src={doc} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const fileIn = document.getElementById("profile_id_upload_input");
                        fileIn?.click();
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-colors border border-white/10 cursor-pointer"
                    >
                      + Add ID Document
                    </button>
                    <button 
                      onClick={() => handleWipeIdDocuments(seeker.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-colors border border-red-500/25 cursor-pointer"
                    >
                      Wipe All IDs
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-xs text-slate-400 font-medium">No verified ID documents loaded.</p>
                  <button 
                    onClick={() => {
                      const fileIn = document.getElementById("profile_id_upload_input");
                      fileIn?.click();
                    }}
                    className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                  >
                    Upload ID Card Now
                  </button>
                </div>
              )}
              <input 
                type="file" 
                id="profile_id_upload_input"
                multiple 
                onChange={(e) => handleProfileIdUploadChange(seeker.id, e)} 
                className="hidden" 
              />
            </div>

            {/* AUDIT LOG TRAIL */}
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-3">
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <History className="w-3.5 h-3.5 text-purple-400" />
                ID Access Digital Audit Trail
              </span>
              <p className="text-[9px] text-slate-400 font-medium leading-relaxed leading-none">
                Cryptographic log showing who viewed your ID inside the secure sandbox.
              </p>
              
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pt-2 pr-1">
                {seeker.idViewLogs && seeker.idViewLogs.length > 0 ? (
                  seeker.idViewLogs.map((log, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/[0.05] p-3 rounded-2xl flex items-center justify-between text-left">
                      <div>
                        <p className="text-[10px] font-black text-slate-200 leading-none">{log.viewer}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-none">{log.role}</p>
                      </div>
                      <span className="text-[8px] font-mono text-purple-400 font-bold">{log.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500 font-bold py-2 text-center uppercase tracking-widest">
                    No access history recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // SPECTATOR VIEW PANEL
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                {access.hasAccess ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-pink-400" />}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white leading-none">
                  {access.hasAccess ? "ID View Permission Granted" : "ID Access Restricted"}
                </p>
                <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1.5">
                  {access.hasAccess ? `Unlocked via ${access.reason}` : `Lock code: ${access.restriction}`}
                </p>
              </div>
            </div>

            {access.hasAccess ? (
              hasDocs ? (
                <div className="space-y-3 font-sans">
                  <p className="text-[9px] text-slate-300 font-medium leading-relaxed leading-none">
                    This seeker allows you to view their verified ID documents. Viewing is audited and strictly restricted to this in-app screen. Download or sharing is disabled to prevent identity theft.
                  </p>
                  <button 
                    onClick={() => {
                      logIdView(seeker.id);
                      setSecureIdDocs(seeker.idDocuments!);
                      setSecureIdOwnerName(seeker.name);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase py-4 rounded-xl text-[10px] tracking-wider active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer leading-none"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    Open Secure In-App Viewer
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium text-center py-2">
                  This seeker has not uploaded any ID documents.
                </p>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-[9.5px] text-slate-300 leading-relaxed font-medium">
                  {seeker.name} has restricted ID viewing to {seeker.shareIdOption === "none" ? "themselves only" : seeker.shareIdOption === "gigs" ? "hirers with active bids" : seeker.shareIdOption === "verified" ? "fully verified portal businesses" : "unlocked levels"}.
                </p>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[9px] text-indigo-300 font-bold flex items-start gap-1.5 uppercase tracking-wide">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    Try configuring your tester profile to match this seeker's requirement to bypass lockdown.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProfileDetail = (propItem: Seeker | Business) => {
    const isSeeker = 'category' in propItem;
    const item = isSeeker 
      ? (allSeekers.find(s => s.id === propItem.id) || propItem)
      : (allBusinesses.find(b => b.id === propItem.id) || propItem);
    const bannerColor = isSeeker ? 'bg-purple-600' : 'bg-orange-600';
    const mainImg = isSeeker ? (item as Seeker).avatar : (item as Business).logo;

    return (
      <div className="h-full flex flex-col overflow-y-auto no-scrollbar pb-10">
        <div className="relative">
          <div className={`${bannerColor} h-40 pt-20 px-6 w-full shadow-2xl relative overflow-hidden`}>
             <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          </div>
          <div 
            onClick={() => mainImg && setFullscreenImage(mainImg)}
            className="absolute left-1/2 -translate-x-1/2 -bottom-14 w-28 h-28 rounded-[40px] border-4 border-white shadow-2xl bg-white overflow-hidden cursor-zoom-in z-20"
          >
             {mainImg ? (
              <img src={mainImg} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                {isSeeker ? <User className="w-12 h-12 text-slate-200" /> : <Briefcase className="w-12 h-12 text-slate-200" />}
              </div>
            )}
          </div>
          {item.isVerified && (
            <div className="absolute right-1/2 translate-x-16 -bottom-16 bg-emerald-500 text-white p-2.5 rounded-full shadow-2xl z-30 border-2 border-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="mt-20 text-center space-y-6 px-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{item.name}</h2>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isSeeker ? 'text-purple-500' : 'text-orange-500'}`}>
              {isSeeker ? (item as Seeker).category : (item as Business).industry}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.location}</p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-[32px] p-6 text-left border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">About</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {isSeeker ? (item as Seeker).bio : (item as Business).description}
              </p>
            </div>

            {isSeeker && (item as Seeker).skills.length > 0 && (
              <div className="space-y-3">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Core Skills</p>
                 <div className="flex flex-wrap gap-2">
                    {(item as Seeker).skills.map((s, i) => (
                      <span key={i} className="bg-purple-50 text-purple-600 text-[10px] font-bold px-4 py-2 rounded-2xl border border-purple-100/50">
                        {s}
                      </span>
                    ))}
                 </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</p>
             <div className="grid grid-cols-2 gap-4">
                <a href={`mailto:${item.email}`} className="bg-white border border-slate-100 p-4 rounded-3xl flex flex-col items-center gap-1 hover:border-blue-200 transition-all shadow-sm">
                  <Send className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate w-full px-2">{item.email}</span>
                </a>
                <a href={`tel:${item.phone}`} className="bg-white border border-slate-100 p-4 rounded-3xl flex flex-col items-center gap-1 hover:border-emerald-200 transition-all shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.phone}</span>
                </a>
             </div>
          </div>

          {isSeeker && renderSecurityAndIdSection(item as Seeker)}

          {isSeeker && (item as Seeker).videoIntro && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video Introduction</p>
                 <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                   <span>🔒 In-App Playback Only</span>
                 </div>
               </div>
               <div className="aspect-video bg-black rounded-[40px] overflow-hidden border-4 border-white shadow-xl relative group">
                  <video 
                    src={(item as Seeker).videoIntro} 
                    className="w-full h-full object-cover" 
                    controls 
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture={true}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     <Video className="w-12 h-12 text-white" />
                  </div>
               </div>
            </div>
          )}

          {isSeeker && !(item as Seeker).videoIntro && (currentUserProfile?.id === item.id) && (
            <button 
              onClick={() => setAppStep("apply_video")}
              className="w-full bg-slate-900 text-white py-5 rounded-[32px] font-black shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Video className="w-5 h-5" />
              Record Video Intro
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderViewApplication = () => {
    if (!selectedApplication) return null;
    const { seeker } = selectedApplication;

    return (
      <div className="h-full flex flex-col pt-20 pb-10 space-y-6">
        <div className="px-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Application Details</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing {seeker.name}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <img src={seeker.avatar} className="w-20 h-20 rounded-full object-cover" />
            <div>
              <h3 className="text-lg font-black text-slate-900">{seeker.name}</h3>
              <p className="text-purple-600 text-xs font-bold uppercase tracking-widest">{seeker.category}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-black text-slate-700 text-sm">Bio</p>
            <p className="text-slate-500 text-xs leading-relaxed">{seeker.bio}</p>
          </div>

          {seeker.videoIntro && (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <p className="font-black text-slate-700 text-sm">Video Introduction</p>
                 <div className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                   <span>🔒 In-App Playback Only</span>
                 </div>
               </div>
               <div className="aspect-video bg-black rounded-[32px] overflow-hidden">
                  <video 
                    src={seeker.videoIntro} 
                    className="w-full h-full object-cover" 
                    controls 
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture={true}
                    onContextMenu={(e) => e.preventDefault()}
                  />
               </div>
            </div>
          )}
        </div>

        <div className="px-6 flex gap-3">
          <button 
            onClick={() => {
              setApplications(prev => prev.map(a => a.id === selectedApplication.id ? {...a, status: "rejected"} : a));
              setAppStep("list");
            }}
            className="flex-1 bg-red-50 text-red-600 py-4 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-red-100 transition-all"
          >
            Reject
          </button>
          <button 
            onClick={() => {
              setApplications(prev => prev.map(a => a.id === selectedApplication.id ? {...a, status: "approved"} : a));
              setAppStep("list");
            }}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all"
          >
            Approve
          </button>
        </div>
      </div>
    );
  };

  const renderDetailView = () => {
    if (appStep === "view_application" && activeView === "Inbox") return renderViewApplication();
    
    if (appStep === "profile_detail") {
      if (activeView === "Seekers" && selectedSeeker) return renderProfileDetail(selectedSeeker);
      if (activeView === "Business" && selectedBusiness) return renderProfileDetail(selectedBusiness);
    }
    
    if (activeView === "Gigs") return renderGigsView();
    if (activeView === "Seekers") return renderSeekersView();
    if (activeView === "Wallet") return renderWalletView();
    if (activeView === "Inbox") return renderInboxView();
    if (activeView === "Instructions") return renderInstructionsView();
    if (activeView === "Business") return renderBusinessView();
    if (activeView === "Admin") return renderAdminView();

    return null;
  };

  return (
    <div className="h-screen flex flex-col font-sans relative overflow-hidden" style={{ backgroundColor: appliedWallpaperColor }}>
      {appliedWallpaperImage ? (
        <div className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none" style={{ backgroundImage: `url(${appliedWallpaperImage})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: wallpaperOpacity / 100 }} />
      ) : (
        backgroundImages.length > 0 && (
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url(${backgroundImages[backgroundImages.length - 1]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )
      )}
      {/* Fullscreen Image Overlay */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-8 right-8 text-white/50 hover:text-white"
            >
              <X className="w-8 h-8" />
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              src={fullscreenImage} 
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl shadow-black"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center justify-center space-x-2"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center"
            >
              <span 
                className="text-6xl font-black tracking-tighter"
                style={{
                  color: "transparent",
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1)),
                    repeating-linear-gradient(0deg, transparent, transparent 18px, #333 18px, #333 20px),
                    repeating-linear-gradient(90deg, #b22222, #b22222 25px, #333 25px, #333 27px)
                  `,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))"
                }}
              >
                TIME
              </span>
              <motion.div
                style={{ display: "inline-block", transformOrigin: "top left" }}
                animate={
                  splashPhase === 'swinging' 
                    ? { rotate: [20, 28, 18, 24, 20] } 
                    : { rotate: 0 }
                }
                transition={
                  splashPhase === 'swinging'
                    ? { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                    : { type: "spring", stiffness: 300, damping: 10 }
                }
                className="relative ml-2 bg-[#faca00] border-2 border-slate-800 rounded-md px-3 py-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
              >
                {splashPhase !== 'swinging' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.1 }}
                    className="absolute -top-1.5 left-2 w-3 h-3 rounded-full border border-slate-900 bg-slate-300 shadow-[inset_1px_1px_2px_black,0_0_2px_black] z-10" 
                  />
                )}
                {splashPhase === 'swinging' && (
                  <div className="absolute -top-1.5 left-2 w-2 h-2 rounded-full border border-slate-800 bg-slate-700 shadow-inner" />
                )}
                <div className="absolute -top-1.5 right-2 w-2 h-2 rounded-full border border-slate-800 bg-black/50 shadow-inner" />
                <span className="font-mono text-3xl font-black text-slate-900 tracking-wider">
                  GIG
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Top Corner Profile Display & Admin Button */}
        {(currentUserProfile || currentBusinessProfile || isAdminAuthenticated) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-8 right-8 z-50 flex items-center gap-3"
          >
             {isAdminAuthenticated && activeView !== "Admin" && (
                <button 
                  onClick={() => { setActiveView("Admin"); setAppStep("list"); }}
                  className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg hover:bg-black transition-all"
                >
                  ADMIN DASHBOARD
                </button>
             )}
            
            {(currentUserProfile || currentBusinessProfile) && (
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 pl-4 rounded-full border border-slate-100 shadow-sm">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-800 leading-none">
                    {currentBusinessProfile?.name || currentUserProfile?.name}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {currentBusinessProfile && (
                      <span className="flex items-center gap-0.5 text-[8px] text-orange-500 font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified Biz
                      </span>
                    )}
                    {currentUserProfile && !currentBusinessProfile && (
                      <span className="text-[8px] text-purple-500 font-bold uppercase tracking-widest">Seeker</span>
                    )}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md flex items-center justify-center ${currentBusinessProfile ? 'bg-orange-50 rounded-2xl' : 'bg-purple-50'}`}>
                  {currentBusinessProfile?.logo ? (
                    <img src={currentBusinessProfile.logo} className="w-full h-full object-cover" />
                  ) : currentUserProfile?.avatar ? (
                    <img src={currentUserProfile.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <User className={`w-5 h-5 ${currentBusinessProfile ? 'text-orange-300' : 'text-purple-300'}`} />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full bg-white relative flex flex-col overflow-hidden pb-24"
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <div className="max-w-6xl mx-auto w-full relative">
              {appStep !== "list" && (
                <button
                  onClick={handleBack}
                  className="absolute top-16 left-4 sm:top-20 sm:left-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all z-50 border border-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              {renderDetailView()}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 h-22 bg-white/95 backdrop-blur-2xl border-t border-slate-100 flex items-center justify-center px-4 z-[999] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]"
      >
        <div className="max-w-3xl w-full flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                stopCamera();
                setActiveView(item.id as View);
                setAppStep("list");
              }}
              className={`flex flex-col items-center gap-1.5 flex-1 transition-all relative py-2 ${activeView === item.id ? 'text-[#ff5500]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`p-2.5 rounded-2xl transition-all ${activeView === item.id ? 'bg-orange-50/80 scale-110' : 'bg-transparent hover:scale-105'}`}>
                <item.icon className={`w-5.5 h-5.5 ${activeView === item.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeView === item.id ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
              {activeView === item.id && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute bottom-0 w-1.5 h-1.5 bg-[#ff5500] rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.nav>
      
      <motion.div 
        layout
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 shrink-0 z-10 pointer-events-none opacity-40 hover:opacity-100 transition-opacity"
      >
        <span className="text-slate-400 text-[8px] font-black tracking-[0.3em] uppercase leading-none">Portal Engine</span>
        <div className="h-0.5 w-6 bg-slate-300 rounded-full" />
      </motion.div>

      {/* Fullscreen Image Viewer Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setFullscreenImage(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-2xl border border-white/20"
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={fullscreenImage} 
              className="max-w-full max-h-[90vh] rounded-2xl shadow-[0_0_100px_rgba(255,255,255,0.05)] object-contain"
            />
          </motion.div>
        )}

        {secureIdDocs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onContextMenu={(e) => e.preventDefault()}
            className="fixed inset-0 z-[10500] bg-slate-950/98 flex flex-col items-center justify-center p-6 select-none"
          >
            {/* Audited Shield Symbol */}
            <div className="absolute top-6 left-6 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Audited Secure Sandbox session</span>
            </div>

            <button
              onClick={() => {
                setSecureIdDocs(null);
                setSecureIdOwnerName("");
              }}
              className="absolute top-6 right-6 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] uppercase tracking-widest font-black rounded-full border border-white/10 transition-all shadow-xl cursor-pointer"
            >
              Close Secure Vault
            </button>

            <div className="max-w-2xl w-full text-center space-y-6">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Cryptographic Portal</span>
                <h2 className="text-xl font-black text-white tracking-tight">Verified ID: {secureIdOwnerName}</h2>
                <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 max-w-md mx-auto text-[10px] text-indigo-200 font-bold uppercase tracking-wider flex items-center justify-center gap-2 leading-tight">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>In-App secure rendering. Saving, screenshotting, or caching is legally prohibited.</span>
                </div>
              </div>

              {/* Secure ID Container with Anti-Screenshot Watermark Grid */}
              <div className="relative aspect-[3/2] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(31,38,135,0.3)] select-none">
                {/* ID Images */}
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={secureIdDocs[0]} 
                    className="max-w-full max-h-full object-contain rounded-2xl pointer-events-none select-none" 
                    referrerPolicy="no-referrer"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>

                {/* Secure Watermark Layer */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 opacity-25 select-none overflow-hidden">
                  {[...Array(6)].map((_, rIdx) => (
                    <div key={rIdx} className="flex justify-between gap-4 -rotate-12 transform scale-110 whitespace-nowrap">
                      {[...Array(3)].map((_, cIdx) => (
                        <span key={cIdx} className="text-indigo-400 text-[8.5px] font-mono tracking-widest font-black select-none">
                          DO NOT COPY • VAULT [AUDITED] • VIEWED BY {getViewerInfo().name.toUpperCase()} • 🔐
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure Footprint */}
              <p className="text-[8.5px] font-mono text-slate-500 uppercase tracking-widest">
                Crypto Session Hash: {Math.random().toString(16).substring(2, 10).toUpperCase()}-SEC-{Date.now()} • ACCESS AUTOMATICALLY RECORDED
              </p>
            </div>
          </motion.div>
        )}
        
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl border border-slate-100 flex flex-col p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto text-left"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-[#ff5500]/10 text-[#ff5500] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                  Authorized Portal v1.2
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tighter text-center">
                  Welcome
                </h1>
                <p className="text-[#64748b] text-[13px] mt-1.5 font-medium max-w-xs">
                  Your premium direct-to-worker on-demand micro-contract platform.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 items-start p-3 bg-slate-50 border border-slate-100/50 rounded-2xl">
                  <div className="p-2 sm:p-2.5 bg-[#ff5500]/10 rounded-xl text-[#ff5500]" id="welcome_gigs_icon">
                    <Briefcase className="w-5 h-5 font-bold" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Gigs & Contracts</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Discover Lightning Gigs, join instant local contracts, or post your own.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-3 bg-slate-50 border border-slate-100/50 rounded-2xl">
                  <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-xl text-blue-500" id="welcome_seekers_icon">
                    <Search className="w-5 h-5 font-bold" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Skills & Seekers</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Create interactive skill profiles, showcase authorized certifications, and secure-share IDs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-3 bg-slate-50 border border-slate-100/50 rounded-2xl">
                  <div className="p-2 sm:p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500" id="welcome_wallet_icon">
                    <Wallet className="w-5 h-5 font-bold" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Verified Wallets</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Manage micro-payouts, upload direct proof-of-payments, or review instant receipts.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInstructions(false)}
                className="mt-8 bg-[#ff5500] hover:bg-[#e04b00] active:scale-98 text-white py-4 rounded-[20px] font-black uppercase tracking-wider text-xs shadow-lg shadow-[#ff5500]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Enter Portal
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {showSentMessage && (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[101] bg-slate-900 text-white p-4 rounded-full shadow-2xl border border-slate-700/50 flex items-center gap-3 backdrop-blur-lg"
            >
                <div className="flex items-center gap-1">
                    <CheckCircle className="w-5 h-5 text-emerald-400"/>
                    <Smile className="w-5 h-5 text-emerald-400"/>
                </div>
                <span className="text-xs font-black">Proof Sent Successfully</span>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


