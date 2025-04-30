import "react-native-gesture-handler";


EB9A91AF6FF27CC7B64E0BEFC541A0DF


import * as POLLYFILL from "./polyfills";
import React, { useState, useCallback, useEffect } from "react";
import "setimmediate";

import { View, ImageBackground, Alert } from "react-native";
import axios from "axios";
import moment from "moment";
import * as _ from "lodash";
import * as Font from "expo-font";
import { createIconSet } from "@expo/vector-icons";
import * as Localization from "expo-localization";
import BaseApp from "@wavemaker/app-rn-runtime/runtime/App";
import { WmMemo } from "@wavemaker/app-rn-runtime/runtime/memo.component";

import { isWebPreviewMode } from "@wavemaker/app-rn-runtime/core/utils";
import NetworkService from "@wavemaker/app-rn-runtime/core/network.service";
import StorageService from "@wavemaker/app-rn-runtime/core/storage.service";
import { ThemeEvent } from "@wavemaker/app-rn-runtime/styles/theme";
import themeVariables from "@wavemaker/app-rn-runtime/styles/theme.variables";
import SecurityService from "@wavemaker/app-rn-runtime/runtime/services/app-security.service";
import AppI18nService from "@wavemaker/app-rn-runtime/runtime/services/app-i18n.service";
import WM from "@wavemaker/app-rn-runtime/runtime/platform.api";

import {
  getThemes,
  getSelectedTheme,
  hasAppTheme,
  setAppTheme,
  resolveThemeAsset,
} from "./app.theme";
import styles from "./app.style";
import fontConfig from "./font.config";
import LocaleResolver from "./src/resolve/locale.resolver";
import ResourceResolver from "./src/resolve/resource.resolver";
import WM_CUSTOM_FORMATTERS from "./src/extensions/formatters";
import getAppVariables from "./src/app.variables";
import bootstrap, { appConfig } from "./bootstrap";
import CommonPartial from "./src/partials/Common/Common.component";
import { initialize as initializeDeviceOperations } from "./src/device-operation-loader";
import Lottie from "lottie-react-native";
import RNRestart from "react-native-restart";
import * as SplashScreen from "expo-splash-screen";
import ReactMoE, { MoEProperties } from "react-native-moengage";
import ReactMoEngageCards from "react-native-moengage-cards";
import {
  MoEInitConfig,
  MoEPushConfig,
  MoEngageLogConfig,
  MoEngageLogLevel,
} from "react-native-moengage";

let _reloadApp = null;

class App extends BaseApp {
  constructor(props) {
    super(props);
    this.reload = () => {
      _reloadApp();
    };
    WM.App = this;
  }

  getSecurityInfo() {
    const defaultSecurityConfig = require("./metadata/app/security-config.json");
    SecurityService.defaultSecurityConfig = defaultSecurityConfig;
    return SecurityService.getLoggedInUserDetails(this.appConfig.url);
  }

  getServiceDefinitions() {
    return axios
      .get(this.baseUrl + "/services/servicedefs")
      .then((response) => response?.data || {})
      .catch(() =>
        import("./metadata/app/service-definitions.json").then(
          (mod) => mod.default,
        ),
      )
      .then((data) => {
        this.serviceDefinitions = data?.serviceDefs || {};
        Object.keys(this.serviceDefinitions).forEach((key) => {
          var sv = this.serviceDefinitions[key]["wmServiceOperationInfo"];
          if (sv) {
            sv.proxySettings.mobile = sv.proxySettings.web;
          }
        });
        return this.serviceDefinitions;
      });
  }

  triggerStartupVariables() {
    return this.startUpVariables.map(
      (s) => this.Variables[s] && this.Variables[s].invoke(),
    );
  }

  loadWmProperties() {
    return axios
      .get(this.baseUrl + "/services/application/wmProperties.js")
      .then((response) => {
        const data = response.data;
        return JSON.parse(data.substring(data.indexOf("{"), data.length - 1));
      })
      .catch(() => import("./src/wmProperties").then((mod) => mod.default))
      .then((appProperties) => {
        this.appConfig.appProperties = appProperties;
        this.appConfig.landingPage = appProperties.homePage;
      });
  }

  loadFonts() {
    fontConfig.fonts.map(
      (f) => (f.path = ResourceResolver.resolve(f.path, this.baseUrl)),
    );
    const fonts = [
      ...themeVariables.INSTANCE.fontConfig?.fonts,
      ...fontConfig.fonts,
    ];
    return Promise.all(
      fonts.map((fc) => {
        const params = {};
        params[fc.name] = fc.path;
        return Font.loadAsync(params).catch(() => {
          console.error(`Not able to load Font ${fc}. `);
        });
      }),
    );
  }

  set activeTheme(themeName) {
    this.setTheme(themeName);
  }

  get activeTheme() {
    return getSelectedTheme();
  }

  setTheme(name) {
    StorageService.setItem("activeTheme", name);
    setAppTheme(name).then(() => this.refresh());
  }

  getTheme() {
    return StorageService.getItem("activeTheme").then((name) => {
      return hasAppTheme(name).then((flag) =>
        flag ? name : this.appConfig.appProperties.activeTheme,
      );
    });
  }

  loadTheme() {
    return this.getTheme().then((theme) => setAppTheme(theme));
  }

  get appLocale() {
    return this.appConfig.appLocale.messages;
  }

  get themes() {
    return getThemes();
  }

  bootstrap() {
    const data = getAppVariables(this);
    this.appConfig.theme = this.appConfig.theme.$new("app-styles", styles);
    this.cleanup.push(
      this.appConfig.theme.subscribe(ThemeEvent.CHANGE, () => {
        this.refresh();
      }),
    );
    this.Variables = data.Variables;
    this.Actions = data.Actions;
    this.startUpVariables = [
      "accountdetailsValidateResponseLO",
      "accountList",
      "accountNameRange",
      "accountNumber",
      "AccountNumberMB",
      "accountNumberVariable",
      "accountNumIdVariable",
      "accountNumValue",
      "AccountsName",
      "accType",
      "actionType",
      "AddBeneficiaryConfirmApprovalBulkCard",
      "AddBeneficiaryGlobal",
      "All_Instances_SR",
      "Alphabetical12",
      "appData",
      "appInfo",
      "approverRawData",
      "ApproverSelection",
      "AppServiceErrorObj",
      "arrayMain",
      "atViewDetailsAddBeneficiaryVAr",
      "atViewDetailsServiceRequestVar",
      "authToken",
      "availBalInfoVar",
      "bodyCustomLogin",
      "bulkModifyAccessCheckList",
      "changeTextLabel",
      "ChannelContext",
      "check",
      "check3",
      "checkVar",
      "Cheque_details",
      "Cheque_series_list",
      "ChequeBookRequest",
      "chequeQueryDetails",
      "COPY_ACTION_setlimits_CA",
      "copyActionSelected",
      "copyActionSetlimit",
      "copyActionSetlimit11_SL",
      "counterpartyId",
      "customerIdSelected",
      "CustomerIdSession",
      "customerIdValue",
      "dashboardBottomNavigationData",
      "dataHold",
      "dataList",
      "demo_login",
      "DepositAccountDetailsSV",
      "DepositStatementSV",
      "deviceCheck",
      "deviceInfo",
      "displayAccNo",
      "divisionId",
      "divisionIdSelected",
      "emailMobileNumberVar",
      "enableBiometricLO",
      "enabled_services_list",
      "enabledisabletoggle",
      "faqDesc",
      "faqsDataVar",
      "faqTitle",
      "Filter_data",
      "finalConfirmChangesList",
      "Flow2_SuccessRecordVar",
      "fullcardType1",
      "fullcardType2",
      "getBFFDepositAccListVar",
      "GetBFFDivisionIdMPVariable",
      "getBFFEnterChequeNumAccFilterServices",
      "halfCard",
      "isUniken",
      "isViewInfo",
      "isVisible",
      "landingPageVar",
      "loggedInUser",
      "loginDetails",
      "loginPassBoolean",
      "mobileNumParValueMultiUserReg",
      "modifyAccountData",
      "modifyTransactionCheckListItems",
      "modifyTransactionCheckListItems2",
      "mpinSetVariable",
      "mpinValue",
      "neftTransactionToggle",
      "newDevicePageLabelChange",
      "oauthTokenServiceVariable",
      "offerBannerItems",
      "onboardData",
      "OnboardingPreloginAction",
      "passwordSet",
      "PendingWithMeBenificiaryTabCard",
      "personaVariable",
      "Positive_Pay_Service",
      "PostloginAction",
      "PreloginAction",
      "referenceid_SFA",
      "RefID",
      "Reportformat",
      "ReqCheAccountNumId",
      "Request_Status_service",
      "RequestType",
      "rulesSelection",
      "rupees",
      "SelectAccountID",
      "selected",
      "selectedAccountID",
      "selectedRule",
      "selectedTimeZone",
      "SelectedUserDetails",
      "SelectedUserFlow",
      "selectedUserMenuLinkage",
      "SelectedworkFlow",
      "selectionApproval",
      "selectPopover_TR",
      "selectRule",
      "selectTimeZone",
      "sessionIntermediateVar",
      "setEnableDisableDataSus",
      "setlimitsDataSus",
      "showAdminInformationPopUp",
      "showEnterPasswordField",
      "showInformationPopUp",
      "showTabs",
      "SL_ModifyLimits_UID",
      "SL_SetLimits_UID",
      "staticVariable1",
      "statusCode",
      "stopInstancesCheckList",
      "stopInstDates",
      "stringChannelContext",
      "supportedLocale",
      "tabIndex",
      "timeRestrictions",
      "TPIN_INPUT",
      "tpinSetVariable",
      "transactionDetails_TR",
      "transactionDetailsVarPar",
      "transApi",
      "tranxDetailsApp",
      "tranxDetailsPar",
      "UnikenInit",
      "userCreation",
      "userData",
      "userDataPasswordSetUp",
      "userDetails",
      "userDetailsData",
      "userList",
      "userListData",
      "userProfileData",
      "valToggle",
      "Var_Cheque_details",
      "viewDetails_SFC",
      "viewLimitAmount",
      "warning",
      "xhrObjResponse",
    ];
    this.startUpActions = [];
    this.autoUpdateVariables = [
      "basicdetails",
      "GetBFFCounterPartyApprovalsListAT",
      "GetBFFCounterPartyHistoryDetailsAT",
      "GETBFFCustomerIdMPVariable",
      "GetBffDownloadPdfVar",
      "getBFFEnterChequeNumAccFilterServices",
      "postRejectMultipleCounterPartyAddBeneficairyFlow",
      "PutBFFModifyafterApproverSFR",
    ];
    this.appConfig.SecurityService.loggedInUser = this.Variables.loggedInUser;
    Object.keys(WM_CUSTOM_FORMATTERS).forEach((k) => {
      this.formatters.set(`custom.${k}`, WM_CUSTOM_FORMATTERS[k]);
    });
    attachScript(this);
    return bootstrap();
  }

  handleLocaleUrl(url) {
    return LocaleResolver.resolve(url);
  }

  handleUrl(url) {
    return resolveThemeAsset(url);
  }

  getDefaultLocale() {
    const appProperties = this.appConfig.appProperties;
    return Promise.resolve()
      .then(() => {
        if (appProperties.preferBrowserLang === "true") {
          return Localization.getLocalizationAsync().then(
            (localizationData) => localizationData.locale,
          );
        }
      })
      .then(
        (userPreferredLocale) =>
          userPreferredLocale || appProperties.defaultLanguage,
      )
      .then((defaultLocale) => {
        return appProperties.supportedLanguages[defaultLocale]
          ? defaultLocale
          : "en";
      });
  }

  changeLocale(newLocale) {
    return Promise.resolve()
      .then(() => newLocale || AppI18nService.getSelectedLocale())
      .then((newLocale) => newLocale || this.getDefaultLocale())
      .then((newLocale) => {
        const needsRestart = AppI18nService.setSelectedLocale(newLocale);
        if (needsRestart) {
          RNRestart.Restart();
        }
        this.appConfig.selectedLocale = newLocale;
        return this.handleLocaleUrl(`i18n/${newLocale}.json`);
      })
      .then((data) => {
        this.appConfig.appLocale = data;
        this.appConfig.currentPage &&
          this.appConfig.currentPage.resetAppLocale();
        this.appConfig.refresh();
      });
  }

  componentDidMount() {
    SplashScreen.hideAsync().then(() => {});
    this.getMoengageInfo();
    this.appConfig.getServiceDefinitions =
      this.getServiceDefinitions.bind(this);
    NetworkService.start(this.appConfig)
      .then(() => {
        console.log("NetworkService started");
      })
      .then(() => this.loadWmProperties())
      .then(() => {
        console.log("WmProperties loaded");
      })
      .then(() => this.loadTheme())
      .then(() => {
        console.log("Theme loaded");
      })
      .then(() => AppI18nService.init())
      .then(() => this.changeLocale())
      .then(() => {
        console.log("Locale files loaded");
      })
      .then(() => this.getSecurityInfo())
      .then(() => {
        console.log("Security info loaded");
      })
      .then(() => this.loadFonts())
      .then(() => {
        console.log("Font files loaded");
      })
      .then(() => initializeDeviceOperations())
      .then(() => {
        console.log("Loaded device operations loaded");
      })
      .then(() => this.bootstrap())
      .then(() => {
        console.log("Bootstrap Complete");
      })
      .then(() => super.componentDidMount())
      .catch((error) => {
        console.error(error);
      })
      .then(() => this.props.onStart());
  }

  getCommonPartial() {
    return (
      <WmMemo
        watcher={this.watcher}
        render={(watch) => {
          return (
            <CommonPartial
              parentWatcher={this.watcher}
              listener={{ onComponentInit: (w) => (this.commonPartial = w) }}
            ></CommonPartial>
          );
        }}
      />
    );
  }

  getMoengageInfo() {
    const moEInitConfig = new MoEInitConfig(
      MoEPushConfig.defaultConfig(),
      new MoEngageLogConfig(MoEngageLogLevel.VERBOSE, true),
    );
    ReactMoE.initialize("V2IXR5MLO01UPO9YXDU5BBFX", moEInitConfig);
    ReactMoE.setAppStatus(false);

    console.log("-----------------------------");

    // ReactMoE.initialize('V2IXR5MLO01UPO9YXDU5BBFX');
    //    ReactMoEngageCards.initialize('V2IXR5MLO01UPO9YXDU5BBFX');

    // ReactMoEngageCards.setDataCenter(DataCenter.DATA_CENTER_3);
  }

  render() {
    return (
      <View
        dir={
          AppI18nService.isRTLLocale(this.appConfig.selectedLocale)
            ? "rtl"
            : null
        }
        style={{
          flex: 1,
          backgroundColor: themeVariables.INSTANCE.pageContentBgColor,
        }}
      >
        {this.isStarted ? super.renderApp(this.getCommonPartial()) : null}
      </View>
    );
  }
}

const attachScript = (App) => {
  //auto refresh functions
  const setTimeout = App.lib.setTimeout;
  const setInterval = App.lib.setInterval;

  /*
   * Use App.getDependency for Dependency Injection
   * eg: var DialogService = App.getDependency('DialogService');
   */
  const ReactNative = require("react-native");
  const WebBrowser = require("expo-web-browser");
  const moment = require("moment");
  const storageService = App.getDependency("StorageService");
  // const NetInfo = require('@react-native-community/netinfo')

  // ****************************************** (Uniken) Set true only if Uniken Methods are being used ******************************
  App.Variables.isUniken.setData().dataValue = true;
  console.log(
    "***********   Uniken is set:",
    App.Variables.isUniken.getData().dataValue,
  );

  if (App.Variables.isUniken.getData().dataValue) {
    console.log("***********  In App js Uniken ****");
    console.log("App on Uniken Initialize *********");

    var { requireNativeModule, EventEmitter } = require("expo-modules-core");
    var unikenModule = requireNativeModule("ExpoModuleUniken");
    const emitter = new EventEmitter(unikenModule);
    App.unikenModule = unikenModule;
    App.emitter = emitter;
  } else {
    console.log("uniken is OFF!");
  }

  /* perform any action on the variables within this block(on-page-load) */
  App.onAppVariablesReady = function () {
    /*
     * variables can be accessed through 'App.Variables' property here
     * e.g. App.Variables.staticVariable1.getData()
     */
  };

  /* perform any action on session timeout here, e.g clearing some data, etc */
  App.onSessionTimeout = function () {
    /*
     * NOTE:getSessionVariable
     * On re-login after session timeout:
     * if the same user logs in(through login dialog)get, app will retain its state
     * if a different user logs in, app will be reloaded and user is redirected to respective landing page configured in Security.
     */
    getSessionVariable;
  };

  App.onBeforeServiceCall = function (requestParams) {
    App.currencySymbol;
    switch (requestParams.method) {
      case "get":
        requestParams.headers.get = {
          interceptorTest: "headerTest",
          ...requestParams.headers.get,
        };
        return requestParams;
      case "post":
        requestParams.headers.post = {
          interceptorTest: "headerTest",
          ...requestParams.headers.post,
        };
        return requestParams;
      case "patch":
        requestParams.headers.patch = {
          interceptorTest: "headerTest",
          ...requestParams.headers.patch,
        };
        return requestParams;
      case "put":
        requestParams.headers.put = {
          interceptorTest: "headerTest",
          ...requestParams.headers.put,
        };
      default:
        return requestParams;
    }
  };
  /*
   * This application level callback function will be invoked after the invocation of PAGE level onPageReady function.
   * Use this function to write common logic across the pages in the application.
   * activePageName : name of the page
   * activePageScope: scope of the page
   * $activePageEl  : page jQuery element
   */
  App.onPageReady = function (activePageName, activePageScope, $activePageEl) {
    // const unsubscribe = NetInfo.addEventListener(state => {
    //     // Page.Variables.networkConnection.setValue() = state.type;
    //     // Page.Variables.networkType.setValue("dataValue", state.type)
    //     // Page.Variables.networkConnection.setValue("dataValue", state.isConnected)
    //     if (state.isConnected === false) {
    //         App.Actions.NoInterNetConnection.invoke();
    //     }
    //     // console.log("Is connected?", state.type);
    //     // console.log("Is connected?", state.isConnected);
    // });

    //**************************************************************** UNIKEN INTIALIZATION  Start *************************************************************
    // DashboardNTB , APPjs , TEMPLogin (2) , UserbankingRegistration (3)

    //unikenNov2023: this function gets called multiple times each time a page is loaded, so avoid duplicates, we will keep this check and return if called once.
    if (App.UNIKEN_INITIALIZE_CALLED) return;

    if (App.Variables.isUniken.getData().dataValue) {
        App.UNIKEN_INITIALIZE_CALLED = true;
      const unikenHost = "mtdreliduat.mypnbone.in";
      const agentInfoMTD =
        "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";
      const agentInfoDev =
        "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";
      var jsonConfig = {
        AGENT_INFO: agentInfoDev,
        UNIKEN_HOST: unikenHost,
        UNIKEN_PORT: 443,
        UNIKEN_ENCRYPTION_TYPE: "AES/256/CFB/PKCS7Padding",
        UNIKEN_SALT: "REL-ID-SAMPLE-SALT", // 'com.pnbcorp.fn',
        LOG_LEVEL: 0,
        PROXY_SETTINGS: "",
        DNS_SERVER_LIST: [""],
      };
      App.unikenModule.initialize(JSON.stringify(jsonConfig));

      const RDNAInitialise = (status) => {
        console.log(status + " Uniken");
        console.log("-----inside ", "RDNAInitialise");
        console.log(JSON.stringify(status));
      };

      App.emitter.addListener("RDNAInitialise", RDNAInitialise);

      const onInitialized = (status) => {
        console.log("Uniken: onInitialized", status);

        try {
          var convertData = JSON.parse(status.response);
          if (convertData.status.statusCode == 100) {
            //unikenNov2023: #2 listen to get user only if initialized.. listener should be added before setting user
            App.emitter.addListener("getUser", getUser);
            App.emitter.addListener("onUserLoggedIn", onUserLoggedIn);
              App.emitter.addListener('onUserLoggedOff', onUserLoggedOff);
              App.emitter.addListener('getAccessCode', getAccessCode);
              App.emitter.addListener('getPassword', getPassword);
              App.emitter.addListener('getUserConsentForLDA', getUserConsentForLDA);

            // now that all listeners are active, lets set user

            // unikenNov2023: #3 simulate setUser
            let userId = "TEST.SACHI242";
            App.unikenModule.setUser(userId);
            var setPassConfig = {
                challengeMode: 0,
                mPinVal:
                'pnb123',
              };  
                App.unikenModule.setPassword(JSON.stringify(setPassConfig));
          }
        } catch (err) {
          console.log("failed to parse uniken data", err);
        }
      };
      App.emitter.addListener("onInitialized", onInitialized);
 
      const onInitializedError = (status) => {
        console.log("Uniken: onInitializedError", status);
      };

      const onUserLoggedOff = (value) => {
        console.log("Uniken: onUserLoggedOff", value);
        console.log("uniken: user has been logged off");

      }
      const getAccessCode = (value) => {
        console.log("Uniken: getAccessCode", value);
        //unikenNov2023: the access code / otp has been sent, we need to open a partial to show the otp box which is not possible from app.js 
        // and needs to be done from page  as a part of business logic. (since this is already done by ios team, i am skipping this step.)
        // after the otp is entered, we need to call setAccessCode function as below.
        const data = JSON.parse(value.response);

        let otpData = '12345';
        App.unikenModule.setAccessCode(otpData);

        //unikenNov2023: once this is called, onUserLoggedIn callback function will get called. we can consider the user as logged in at this stge.
        


        }
        const getPassword  = (value) => {
            console.log("Uniken: getPassword", value);
            const data = JSON.parse(status.response);
            // unikenNov2023: password has been requested here.. ask the password  and send via setPassword.
            console.log(data);

        }
        const getUserConsentForLDA = (value) => {
            console.log("Uniken: getUserConsentForLDA", value);
            console.log('user\'s concent has been requested from uniken');

            let is_biometric = false;
       
            let jsonResponse = JSON.parse(value.response);
            setLdaChallengeModeResponse = jsonResponse.challengeMode;
            setLdaAuthenticationTypeResponse = jsonResponse.authenticationType;

            var ldaConfig = {
              shouldEnrollLDA: is_biometric,
              challengeMode: setLdaChallengeModeResponse,
              authenticationType: setLdaAuthenticationTypeResponse,
            };

            App.unikenModule.setUserConsentForLDA(JSON.stringify(ldaConfig));
        }

      const onInitializeProgress = (status) => {
        console.log("Uniken: onInitializeProgress", status);
      };
      App.emitter.addListener("onInitializeProgress", onInitializeProgress);

      App.emitter.addListener("onInitializeError", onInitializedError);

      const onSecurityThreat = (status) => {
        console.log("Uniken: onSecurityThreat", onSecurityThreat);
      };
      App.emitter.addListener("onSecurityThreat", onSecurityThreat);
      const onTerminate = (threats) => {
        console.log("Uniken: threats", threats);
      };
      App.emitter.addListener("onTerminate", onTerminate);
      const onUserConsentThreats = (threats) => {
        console.log("Uniken: onUserConsentThreats", threats);
        let threads_list = JSON.parse(threats);
        let msgs = [];
        threads_list.map((item,i)=>{
          msgs.push(item.threatMsg);
        })
        msgs = msgs.join("\n");
        Alert.alert(Caution,msgs, [
          {
            text: 'Exit',
            onPress: () => {
              App.unikenModule.takeActionOnThreats(threats);
            },
            style: 'cancel',
          },
          {text: 'Continue', onPress: () => {

            threads_list = threads_list.map((item,i)=>{
              item.rememberActionForSession = true;
              item.shouldProceedWithThreats = true;
            })
             

            App.unikenModule.takeActionOnThreats(JSON.stringify(threads_list));
            
          }},
        ]);
      };
      App.emitter.addListener("onUserConsentThreats", onUserConsentThreats);

      const getUser = (status) => {
        console.log("Uniken: getUser", status);
        const alreadyRegUsers = JSON.parse(status.response);
        var rememberedUsersRecords = alreadyRegUsers.rememberedUsers;
        App.rememberedUsersRecords = rememberedUsersRecords;
        console.log('Uniken remembered users:', rememberedUsersRecords);
      };

      const onUserLoggedIn = (status) => {
        console.log("Uniken: onUserLoggedIn", status);
        console.log("uniken: user has been logged in");
        const data = JSON.parse(status.response);

        console.log('now lets log the user out!');
        App.unikenModule.logOff();
        
      };

      const onSessionTimeout = (status) => {
        console.log("Uniken: onSessionTimeout", status);
        App.unikenModule.initialize(JSON.stringify(jsonConfig));
      };
      App.emitter.addListener("onSessionTimeout", onSessionTimeout);

      //unikenNov2023: #1 initialize should be at last after the listening is done, so that events could get back to js layer
      App.unikenModule.initialize(JSON.stringify(jsonConfig));
    } else console.log("********** Uniken is Off ************");
    

    //******************************************************* UNIKEN ***********************************************************************

    //**************************************************************** UNIKEN INTIALIZATION  End *************************************************************
  };
  App.getLocalizedData = function (key) {
    const val = App.appConfig.appLocale.messages[key];
    if (val) {
      return val;
    } else {
      return key;
    }

    // let Array1 = ['data1', 'data2', 'data3', 'data4'];

    // App.Variables.arrayMain.dataSet = Array1;
    // console.log("=================", App.Variables.arrayMain.dataSet)
  };
  App.translator = function (key) {
    const langTranslation = {
      en: "English",
      hi: "Hindi",
      gu: "Gujarati",
      bn: "Bengali",
      kn: "Kannada",
      ml: "Malayalam",
      or: "Odia",
      ta: "Tamil",
      te: "Telugu",
      mr: "Marathi",
    };
    return langTranslation[key] ? langTranslation[key] : key;
  };

  /*
   * This application level callback function will be invoked after a Variable receives an error from the target service.
   * Use this function to write common error handling logic across the application.
   * errorMsg:    The error message returned by the target service. This message will be displayed through appNotification variable
   *              You can change this though App.Variables.appNotification.setMessage(YOUR_CUSTOM_MESSAGE)
   * xhrObj:      The xhrObject used to make the service call
   *              This object contains useful information like statusCode, url, request/response body.
   */
  App.onServiceError = function (errorMsg, xhrObj) {
    App.Variables.xhrObjResponse.dataSet = xhrObj.response;
    let serviceURL = xhrObj.request.responseURL;
    let serviceNameFromXHR =
      serviceURL.split("/")[4] +
      ">>" +
      serviceURL.split("/")[5] +
      ">>" +
      serviceURL.split("/")[6] +
      ">>" +
      serviceURL.split("/")[7]; //URL.split method gives a list of splitted strings by '/'

    if (ReactNative.Platform.OS == "web") {
      App.Variables.AppServiceErrorObj.setData().serviceName =
        serviceURL.split("/")[7] + "::" + serviceURL.split("/")[8];
    } else {
      //phone 2
      App.Variables.AppServiceErrorObj.setData().serviceName =
        serviceURL.split("/")[5] + "::" + serviceURL.split("/")[6];
    }

    App.Variables.AppServiceErrorObj.setData().errorMessage = errorMsg;
    // App.Variables.AppServiceErrorObj.setData().serviceName1 = serviceURL.split("/")[5];
    // App.Variables.AppServiceErrorObj.setData().serviceName2 = serviceURL.split("/")[6];
    // App.Variables.AppServiceErrorObj.setData().serviceName3 = serviceURL.split("/")[7];
    // App.Variables.AppServiceErrorObj.setData().serviceName = serviceNameFromXHR;

    //Global Error Toast For Services fail
    if (App.Variables.xhrObjResponse.dataSet.status !== 301) {
      App.Actions.AppServiceErrorNotify.invoke();
    }
    App.Variables.statusCode.setData().status = xhrObj.request.status;
    if (
      xhrObj.response.data.authorizationDetails !== null ||
      xhrObj.response.data.authorizationDetails !== undefined
    ) {
      console.log("Authenitcation required");
      App.Variables.statusCode.setData().authorizationDetails =
        xhrObj.response.data.authorizationDetails;

      App.Variables.ChannelContext.dataSet.authorizationDetails.primaryAccessCode =
        "666999";

      console.log("dataset", App.Variables.ChannelContext.dataSet);

      App.Variables.ChannelContext.dataSet.authorizationDetails.workflowInput.userRemarks =
        "OK";

      App.Variables.stringChannelContext.setData().dataValue = JSON.stringify(
        App.Variables.ChannelContext.dataSet,
      );
    }
  };

  /* Font Scaling disable starts */
  ReactNative.Text.defaultProps = ReactNative.Text.defaultProps || {};
  ReactNative.TextInput.defaultProps = ReactNative.TextInput.defaultProps || {};
  ReactNative.Text.defaultProps.allowFontScaling = false;
  ReactNative.TextInput.defaultProps.allowFontScaling = false;
  /* Font Scaling disable ends */

  function splitDates(date) {
    let dateObject = {};
    const regExp = new RegExp("[-./]");
    const delimiter = date.match(regExp)[0];
    const splitDate = date.split(delimiter);
    if (delimiter) {
      let i = 0;
      let increment = +1;
      if (splitDate[0].length !== 4) {
        increment = -1;
        i = 2;
      }
      dateObject.formattedDate =
        splitDate[i] +
        delimiter +
        splitDate[i + increment] +
        delimiter +
        splitDate[i + 2 * increment];
    }
    return dateObject;
  }

  App.compareDates = function (date1, date2, comparisonType) {
    let formattedDate1,
      formattedDate2,
      returnValue = false;
    if (date1 && date2) {
      date1 instanceof Date
        ? (formattedDate1 = date1)
        : (formattedDate1 = new Date(splitDates(date1).formattedDate));
      date2 instanceof Date
        ? (formattedDate2 = date2)
        : (formattedDate2 = new Date(splitDates(date2).formattedDate));
      if (!comparisonType) {
        comparisonType = "default";
      }
      switch (comparisonType.toLowerCase()) {
        case "anniversary":
          if (
            formattedDate1.getDate() === formattedDate2.getDate() &&
            formattedDate1.getMonth() === formattedDate2.getMonth()
          )
            returnValue = true;
          break;
        default:
          if (
            formattedDate1.getDate() === formattedDate2.getDate() &&
            formattedDate1.getMonth() === formattedDate2.getMonth() &&
            formattedDate1.getFullYear() === formattedDate2.getFullYear()
          )
            returnValue = true;
      }
    } else {
      console.log("Enter the valid date to check...");
    }
    return returnValue;
  };

  /********************** CCL Default link card - Redirectional function starts *****************************************/

  App.handleRedirection = function (ctaType, url) {
    let deviceName = App.Variables.deviceInfo.dataSet.os;
    if (
      ctaType === "system-browser-redirection" ||
      ctaType === "system-app-redirection"
    ) {
      WebBrowser.openBrowserAsync(url);
    } else if (ctaType === "web-view-redirection") {
      App.Actions["goToPage_webviewPage"].navigate(
        {
          data: {
            url,
          },
        },
        function (response) {
          console.log("Response from the Webview widget: ", response);
        },
        function (error) {
          console.log("Error from the Webview widget: ", error);
        },
      );
    } else if (ctaType === "app-route-redirection") {
      let pagename = "goToPage_" + url;
      App.Actions[pagename].navigate();
    }
  };

  /********************** CCL Default link card - Redirectional function ends *****************************************/

  /************************* AccountNumber Formatter function starts ******************************/
  App.formatAccountNumber = function (accNumber, position, maskChar = "*") {
    if (accNumber && /^\d{16}$/.test(accNumber)) {
      accNumber = accNumber.toString();
      let maskedData;
      switch (position) {
        case "start":
          maskedData = accNumber.substring(0, 4).replace(/\d/g, maskChar);
          return maskedData + accNumber.substring(4, accNumber.length);
        case "middle":
          maskedData = accNumber
            .substring(4, accNumber.length - 4)
            .replace(/\d/g, maskChar);
          return (
            accNumber.substring(0, 4) +
            maskedData +
            accNumber.substring(accNumber.length - 4, accNumber.length)
          );
        case "end":
          maskedData = accNumber
            .substring(accNumber.length - 4, accNumber.length)
            .replace(/\d/g, maskChar);
          return accNumber.substring(4, accNumber.length) + maskedData;
        default:
          return accNumber
            .substring(0, accNumber.length)
            .replace(/\d/g, maskChar);
      }
    }
    return "";
  };
  /************************* AccountNumber Formatter function ends ******************************/

  /************************* Account Number Masking function starts ******************************/
  /*
   * [maskAccNo] function masks account number by keeping the first four and last four digits unmask.
   * It masks account number if it is more than 16 characters or if 'forceMask' is set as true.
   * 'forceMask' flag can be used in cases where account number is <= 16 digits and masking is necessary.
   */
  App.maskAccNo = function (unmaskAcc, forceMask = false) {
    if (unmaskAcc) {
      if (unmaskAcc.length > 16 || forceMask === true)
        return (
          unmaskAcc.substring(0, 4) +
          " •••••••• " +
          unmaskAcc.substring(unmaskAcc.length - 4)
        );
      else return App.groupAccNo(unmaskAcc);
    }
  };

  /************************* Account Number Masking function ends ******************************/

  /************************* Account Number Grouping function starts ******************************/
  // [groupAccNo] function formats the account number into the groups of four digits.
  App.groupAccNo = function (rawAccNo) {
    if (rawAccNo) {
      let groupedAccNo = rawAccNo;
      for (let i = 0; i < Math.ceil(rawAccNo.length / 4); i++) {
        groupedAccNo = groupedAccNo.replace(/(\d{4})(\d{1,})/g, "$1 $2");
      }
      return groupedAccNo;
    }
    return "";
  };

  App.currencySymbol = function (amountStr) {
    let arr = _.split(amountStr, "|");
    if (arr[0] === "INR") {
      // return _.join(arr, " ");
      return "₹ " + arr[1];
    }
    return amountStr;
  };

  /************************* Account Number Grouping function ends ******************************/

  /********************** App level variable getter setter function *****************************************/

  App.getAppVariable = function (variableName) {
    if (typeof App.Variables[variableName] !== "undefined") {
      let result = App.Variables[variableName].getData();
      return result;
    }
  };
  App.setAppVariable = function (variableName, value, key) {
    if (typeof App.Variables[variableName] !== "undefined") {
      if (key) {
        App.Variables[variableName].setValue(key, value);
      } else {
        App.Variables[variableName].setData(value);
      }
      return App.getAppVariable(variableName);
    }
  };

  /********************** App level variable getter setter function End *****************************************/

  /************************* Currency Formatter ******************************/

  App.currencyFormatter = function (amount, currency) {
    let amountResult;

    if (!currency) {
      currency = amount.split(" ")[0];
      amount = amount.split(" ")[1];
    }

    const data = {
      INR: "en-IN",
      USD: "en-US",
    };

    amount = parseFloat(amount);

    const formattedAmount = isNaN(amount)
      ? amount
      : amount.toLocaleString(data[currency], {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

    amountResult = formattedAmount[0] + " " + formattedAmount.substr(1);

    return amountResult;
  };

  /******************************************************************************/

  /********************** Session variable getter setter function *****************************************/

  App.getSessionVariable = function (key) {
    let sessionData;
    if (typeof App.Variables.sessionIntermediateVar === "object") {
      if (key && typeof key === "string") {
        sessionData = App.Variables.sessionIntermediateVar.getValue(key);
      } else {
        sessionData = App.Variables.sessionIntermediateVar.getData();
      }
    }
    return sessionData;
  };
  App.setSessionVariable = function (key, value) {
    if (typeof App.Variables.sessionIntermediateVar === "object") {
      App.Variables.sessionIntermediateVar.setValue(key, value);
    }
  };
  App.clearSessionVariable = function (key = null) {
    if (typeof App.Variables.sessionIntermediateVar === "object") {
      if (key && typeof key === "string") {
        App.Variables.sessionIntermediateVar.setValue(key, null);
      } else {
        App.Variables.sessionIntermediateVar.clearData();
      }
    }
  };

  /********************** Session variable getter setter function End *****************************************/

  /***** Performing Alphabetical sort based on grouping of key elements in the ascending order *****/

  App.alphabeticalSort = function (dataList, keyList) {
    const sortedList = dataList.sort(function (a, b) {
      const concatValues = function (item) {
        return keyList.map(function (key) {
          let data = item[key] === undefined ? "" : item[key];
          return data;
        });
      };

      const concatValueA = concatValues(a).join(" ");
      const concatValueB = concatValues(b).join(" ");

      if (concatValueA < concatValueB) {
        return -1;
      }
      if (concatValueA > concatValueB) {
        return 1;
      }
      return 0;
    });

    /* It will take the first character of first item from keyList for comparison */

    let refLetter = sortedList[0][keyList[0]].charAt(0);
    let filteredData = [];
    let groupedData = [];
    sortedList.forEach(function (item) {
      if (item[keyList[0]].charAt(0) === refLetter) {
        groupedData.push(item);
      } else {
        filteredData.push({
          key: refLetter.toUpperCase(),
          list: groupedData,
        });
        groupedData = [item];
        refLetter = item[keyList[0]].charAt(0);
      }
    });
    if (groupedData.length) {
      filteredData.push({
        key: refLetter.toUpperCase(),
        list: groupedData,
      });
    }

    return filteredData;
  };

  /************************* Alphabetical sort ends *************************/

  /* Date sorting based on the date created and the last modified for both the latest and the newest data */

  App.dateSort = function (data, type, order) {
    let value;
    const sortedDateList = data.sort(function (a, b) {
      const dateA = moment(a[type], "DD/MM/YYYY");
      const dateB = moment(b[type], "DD/MM/YYYY");
      if (order === "oldestFirst") value = dateA.isBefore(dateB) ? -1 : 1;
      else value = dateA.isAfter(dateB) ? -1 : 1;
      return value;
    });

    let refDate = moment(sortedDateList[0][type], "DD/MM/YYYY").format(
      "DD MMM YYYY",
    );
    let filteredData = [];
    let groupedData = [];
    sortedDateList.forEach(function (item) {
      const currentDate = moment(item[type], "DD/MM/YYYY").format(
        "DD MMM YYYY",
      );
      if (currentDate === refDate) {
        groupedData.push(item);
      } else {
        filteredData.push({
          key: refDate,
          list: groupedData,
        });
        groupedData = [item];
        refDate = currentDate;
      }
    });
    if (groupedData.length) {
      filteredData.push({
        key: refDate,
        list: groupedData,
      });
    }

    return filteredData;
  };

  /************************* Date sort ends *************************/

  /**************************Amount value to Words Conversion starts****************************/

  App.amtInWords = function (numberInput) {
    var numberSplit = numberInput.split(".");
    numberInput = numberSplit[0];
    var paiseCheck = numberSplit[1];
    var isPaise = numberSplit.length > 1;
    var oneToTwenty = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    var tenth = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    var numArray = ("000000000000" + numberInput)
      .slice(-12)
      .match(/^(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (numberInput.length > 12) {
      return "Over limit for conversion";
    } else {
      var outputText = "";
      for (i = 1; i < numArray.length; i++) {
        outputText +=
          numArray[i] != 0
            ? oneToTwenty[Number(numArray[i])] ||
              tenth[numArray[i][0]] + " " + oneToTwenty[numArray[i][1]]
            : "";
        switch (i) {
          case 1:
            numArray[i] != 0 ? (outputText += "Thousand ") : "";
            break;
          case 2:
            numArray[i] != 0 ? (outputText += "Hundred ") : "";
            break;
          case 3:
            numArray[i] != 0 ? (outputText += "Crore ") : "";
            break;
          case 4:
            numArray[i] != 0 ? (outputText += "Lakh ") : "";
            break;
          case 5:
            numArray[i] != 0 ? (outputText += "Thousand ") : "";
            break;
          case 6:
            numArray[i] != 0 ? (outputText += "Hundred ") : "";
            break;
          case 7:
            numArray[i] != 0 ? (outputText += "") : "";
            break;
        }
      }
      outputText +=
        outputText !== "" ? (outputText === "One " ? "rupee " : "rupees ") : "";
      if (isPaise) {
        numArray.push(paiseCheck);
        outputText +=
          numArray[8] != 0
            ? "and " +
              (oneToTwenty[Number(numArray[8])] ||
                tenth[numArray[8][0]] + " " + oneToTwenty[numArray[8][1]]) +
              "paise "
            : "";
      }
      if (outputText === "") {
        return "Incorrect Value";
      } else {
        outputText += "only";
        return outputText;
      }
    }
  };

  /**************************Amount value to Words Conversion ends****************************/

  //Custom Login Service Variable on Success

  App.customLoginServiceVariableonSuccess = function (variable, data) {
    console.log("App.customLoginServiceVariableonSuccess");

    // App.Actions.customLogoutAction.invoke();
  };

  //Custom Login Service Variable on Error

  App.customLoginServiceVariableonError = function (variable, data) {
    // App.Actions.loginErrorResponse.invoke();
  };

  //PostloginAction routes

  App.PostloginActiononSuccess = async function (variable, data) {
    App.setSessionVariable("isUserLoggedIn", true);
    //setting logged in Time in Session Variable

    let loggedTime, hour, min, date, month, year;
    hour = moment().hours();
    min = moment().minutes();
    date = moment().date();
    month = moment().format("MMM");
    year = moment().year();

    loggedTime = hour + ":" + min + ", " + date + " " + month + " " + year;

    App.setSessionVariable("loggedInTime", loggedTime);
    //***************logged in Time in Session Variable set ****************
    let usertype = await storageService.getItem("Persona");

    //

    const Full_Name = await storageService.getItem("firstName");
    // const MidleName = await storageService.getItem("MidleName");
    // const lastName = await storageService.getItem("lastName");
    const Name = await storageService.getItem("Name");
    const corpId = await storageService.getItem("corpId");
    const userId = await storageService.getItem("UserId");
    const persona = await storageService.getItem("Persona");
    const Password = await storageService.getItem("Password");
    const mpin = await storageService.getItem("Mpin");
    const enableBiometric = await storageService.getItem("enableBiometric");
    App.Variables.userDetails.dataSet.loginuserid = corpId + "." + userId;
    App.Variables.userDetails.dataSet.password = Password;
    App.Variables.userDetails.dataSet.userid = userId;
    App.Variables.userDetails.dataSet.corpid = corpId;
    App.Variables.userDetails.dataSet.usertype = persona;

    // let usertype = App.Variables.userDetails.dataSet.usertype
    if (usertype === "CSNGL") {
      App.Actions.goToPage_solePropTransactDashboardPg.invoke();
    } else if (usertype === "CUSER") {
      App.Actions.goToPage_cUserDashboard.invoke();
    } else if (usertype === "CVIEW") {
      App.Actions.goToPage_cViewDashboardPg.invoke();
    } else if (usertype === "CRPADM") {
      App.Actions.goToPage_adminDashboardPg.invoke();
    } else if (usertype === "CSNGLV") {
      App.Actions.goToPage_solePropTransactViewDashboardPg.invoke();
    } else {
      App.Actions.goToPage_solePropTransactDashboardPg.invoke();
    }
  };

  App.GetBFFCounterPartyDetailsUnderApprovalATonSuccess = function (
    variable,
    data,
  ) {};

  App.redirectToDashboard = function () {
    let usertype = App.Variables.userDetails.getData().usertype;
    if (usertype === "CSNGL") {
      App.Actions.goToPage_solePropTransactDashboardPg.invoke();
    } else if (usertype === "CUSER") {
      App.Actions.goToPage_cUserDashboard.invoke();
    } else if (usertype === "CVIEW") {
      App.Actions.goToPage_cViewDashboardPg.invoke();
    } else if (usertype === "CRPADM") {
      App.Actions.goToPage_adminDashboardPg.invoke();
    } else if (usertype === "CSNGLV") {
      App.Actions.goToPage_solePropTransactViewDashboardPg.invoke();
    } else {
      App.Actions.goToPage_solePropTransactDashboardPg.invoke();
    }
  };

  App.testPostLoginActiononSuccess = async function (variable, data) {
    App.setSessionVariable("isUserLoggedIn", true);
    //setting logged in Time in Session Variable

    let loggedTime, hour, min, date, month, year;
    hour = moment().hours();
    min = moment().minutes();
    date = moment().date();
    month = moment().format("MMM");
    year = moment().year();

    loggedTime = hour + ":" + min + ", " + date + " " + month + " " + year;

    App.setSessionVariable("loggedInTime", loggedTime);
    //***************logged in Time in Session Variable set ****************
    let usertype = await storageService.getItem("Persona");

    //

    const Full_Name = await storageService.getItem("firstName");
    // const MidleName = await storageService.getItem("MidleName");
    // const lastName = await storageService.getItem("lastName");
    const Name = await storageService.getItem("Name");
    const corpId = await storageService.getItem("corpId");
    const userId = await storageService.getItem("UserId");
    const persona = await storageService.getItem("Persona");
    const Password = await storageService.getItem("Password");
    const mpin = await storageService.getItem("Mpin");
    const enableBiometric = await storageService.getItem("enableBiometric");
    App.Variables.userDetails.dataSet.loginuserid = corpId + "." + userId;
    App.Variables.userDetails.dataSet.password = Password;
    App.Variables.userDetails.dataSet.userid = userId;
    App.Variables.userDetails.dataSet.corpid = corpId;
    App.Variables.userDetails.dataSet.usertype = persona;

    // let usertype = App.Variables.userDetails.dataSet.usertype
    if (usertype === "CSNGL") {
      App.Actions.goToPage_solePropTransactDashboardPg.invoke();
    } else if (usertype === "CUSER") {
      App.Actions.goToPage_cUserDashboard.invoke();
    } else if (usertype === "CVIEW") {
      App.Actions.goToPage_cViewDashboardPg.invoke();
    } else if (usertype === "CRPADM") {
      App.Actions.goToPage_adminDashboardPg.invoke();
    } else if (usertype === "CSNGLV") {
      App.Actions.goToPage_solePropTransactViewDashboardPg.invoke();
    } else {
      App.Actions.goToPage_solePropTransactDashboardPg.invoke();
    }
  };

  App.MoEngageSetUserId = function (userId) {
    ReactMoE.setUserUniqueID(userId);
  };
  App.MoEngageSetUserInfo = function (data) {
    if (!data) return;
    if (data.firstName) {
      ReactMoE.setUserFirstName(data.firstName);
    }
    if (data.lastName) {
      ReactMoE.setUserLastName(data.lastName);
    }
    if (data.email) {
      ReactMoE.setUserEmailID(data.email);
    }
    if (data.tel) {
      ReactMoE.setUserContactNumber(data.tel);
    }
    if (data.gender) {
      ReactMoE.setUserGender(data.gender); // OR Female
    }
  };

  App.MoEngageUpdateUserId = function (userId) {
    ReactMoE.setAlias(userId);
  };
  App.MoEngageLogout = function () {
    ReactMoE.logout();
  };
  App.MoEngageTrackEvent = function (eventName, eventData) {
    let properties = new MoEProperties();
    if (eventData) {
      let keys = Object.keys(eventData);
      keys.map((item) => {
        properties.addAttribute(item, eventData[item]);
      });
    }
    ReactMoE.trackEvent(eventName, properties);
  };

  App.MoEngageGetCards = function (cb) {
    ReactMoEngageCards.onCardSectionLoaded(async (data) => {
      // console.log('---> cards data', data);

      //const cardsInfo = await ReactMoEngageCards.getCardsInfo();
      const cardsInfo = await ReactMoEngageCards.fetchCards();
      console.log("---> cardInfo", cardsInfo);
      // alert(JSON.stringify(cardsInfo));
      cb && cb(cardsInfo);

      // console.log('---> imageURL', cardsInfo.cards[0].template.containers[0].widgets[0].content);
      // console.log('--> titleMessage', cardsInfo.cards[0].template.containers[0].widgets[1].content);  // Title message
      // console.log('-->bodyMessage', cardsInfo.cards[0].template.containers[0].widgets[2].content);  // Body message
    });
  };

  App.MoEngageShowInApp = function () {
    ReactMoE.showInApp();
  };
};

const AnimatedSplash = (props) => {
  useEffect(() => {
    SplashScreen.hideAsync().then(() => {});
  }, []);
  return appConfig.splash.src.includes("splash-bg") ? (
    <ImageBackground
      source={ResourceResolver.resolve(appConfig.splash.src, appConfig.url)}
      resizeMode="cover"
      style={{ justifyContent: "center", width: "100%", height: "100%" }}
    >
      <Lottie
        source={ResourceResolver.resolve(
          appConfig.splash.animationSrc,
          appConfig.url,
        )}
        autoPlay={true}
        loop={true}
      />
    </ImageBackground>
  ) : (
    <Lottie
      source={ResourceResolver.resolve(
        appConfig.splash.animationSrc,
        appConfig.url,
      )}
      autoPlay={true}
      loop={true}
    />
  );
};

export default (props) => {
  props = props || {};
  const [visible, setVisible] = useState(true);
  const [isAppStarted, setIsAppStarted] = useState(false);
  _reloadApp = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setVisible(true);
    }, 100);
  }, [visible]);
  return visible ? (
    <>
      {!isAppStarted ? <AnimatedSplash /> : null}
      <App {...props} onStart={() => setIsAppStarted(true)} />
    </>
  ) : (
    <AnimatedSplash />
  );
};
