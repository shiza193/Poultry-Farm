export const CustomConstants = {
  LOGIN_SCREEN: 'LoginScreen',
  SPLASH_SCREEN: 'SplashScreen',
  DASHBOARD_SCREEN: 'DashboardScreen',
  BOOTOM_TAB_NAVIGATION: 'BootomTabNavigation',
  USER_SCREEN: 'UserScreen',
  CUSTOMER_SCREEN: 'CustomerScreen',

  DASHBOARD_TABS: 'DashboardTabs',
  FLOCKS_TABS: 'FlocksTabs',

  SUPPILER_SCREEN: 'SupplierScreen',
  DASHBOARD_DETAIL_SCREEN: 'DashboardDetailScreen',

  FLOCK_SALE_SCREEN: 'FlockSaleScreen',
  FLOCKS_MORTALITY_SCREEN: 'FlocksMortalityScreen',
  FLOCKS_SCREEN: 'FlocksScreen',
  FLOCK_STOCK_SCREEN: 'FlockStockScreen',
  HOSPITALITY_SCREEN: 'HospitalityScreen',
  EGG_PRODUCTION_SCREEN: 'EggProductionScreen',
  EGG_STOCK_SCREEN: 'EggStockScreen',
  EGG_SALE_SCREEN: 'EggSaleScreen',
  MAIN_LAYOUT: 'MainLayout',
  EGG_TABS: 'EggTabs',
  POULTRY_DETAIL_TAB: 'PoultryDetailTab',
  MENU_LIST_SCREEN: 'MenuListScreen',
  SETTINGS_SCREEN: 'SettingsScreen',

  EMPLOYEE_SCREEN: 'EmployeeScreen',

  ABOUT_US_SCREEN: 'AboutUsScreen',
  VACCINATIONS_SCREEN: 'VaccinationsScreen',
  VACCINE_SCHEDULE_SCREEN: 'VaccineScheduleScreen',
  VACCINATION_STOCK_SCREEEN: 'VaccinationStockScreen',
  SIGN_UP_SCREEN: 'SignUpScreen',
  ACCOUNT_HEAD_SCREEN: 'AccountHeadScreen',
} as const;

// ScreenType only includes tabs that MainLayout handles
export type ScreenType =
  | typeof CustomConstants.DASHBOARD_TABS
  | typeof CustomConstants.FLOCKS_TABS
  | typeof CustomConstants.EGG_TABS
  | typeof CustomConstants.FLOCKS_SCREEN
  | typeof CustomConstants.FLOCK_STOCK_SCREEN
  | typeof CustomConstants.FLOCKS_MORTALITY_SCREEN
  | typeof CustomConstants.FLOCK_SALE_SCREEN
  | typeof CustomConstants.HOSPITALITY_SCREEN
  | typeof CustomConstants.DASHBOARD_DETAIL_SCREEN
  | typeof CustomConstants.EGG_STOCK_SCREEN
  | typeof CustomConstants.EGG_SALE_SCREEN
  | typeof CustomConstants.EGG_PRODUCTION_SCREEN
  | typeof CustomConstants.CUSTOMER_SCREEN
  | typeof CustomConstants.EMPLOYEE_SCREEN
  | typeof CustomConstants.SUPPILER_SCREEN
  | typeof CustomConstants.VACCINATIONS_SCREEN
  | typeof CustomConstants.VACCINATION_STOCK_SCREEEN
  | typeof CustomConstants.VACCINE_SCHEDULE_SCREEN;
