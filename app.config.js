module.exports = {
  expo: {
    name: "HostelMart1",
    slug: "HostelMart1",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    updates: {
      enabled: false
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://itkojptodexfkbkmjexz.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0a29qcHRvZGV4Zmtia21qZXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA5MzU1NzcsImV4cCI6MjAyNjUxMTU3N30.Hs-Ey_pMJqQFnYs8YJqLDsHXkgxF3GpqQDhHdjE_Ync"
    }
  }
}; 