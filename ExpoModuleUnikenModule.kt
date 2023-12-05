package expo.modules.moduleuniken

import android.os.Bundle
import android.util.Log
import com.uniken.rdna.RDNA
import com.uniken.rdna.RDNA.RDNACallbacks
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoModuleUnikenModule : Module(){

  private val TAG = "UNIKEN";
  private var rdnaObj: RDNA? = RDNA.getInstance();
  private lateinit var unikenHandler: UnikenHandler;
  private var callbacks: RDNACallbacks? = null // Callback object to get the runtime status of RDNA.

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoModuleUniken')` in JavaScript.
    Name("ExpoModuleUniken")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
            "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange","RDNAInitialise","callBackResponseHandle", "onUserConsentThreats", "onInitializeError", "onInitializeProgress",  "getUser",  "getActivationCode",  "getPassword",  "getDeviceName",  "getAccessCode",  "addNewDeviceOptions",  "onUserLoggedIn",  "onTOTPRegistrationStatus",  "onTOTPGenerated",  "getTOTPPassword",  "activateUserOptions",  "onUserLoggedOff",  "onInitialized",  "onLoginIdUpdateStatus",  "onCredentialsAvailableForUpdate",  "onUpdateCredentialResponse",  "onHandleCustomChallenge",  "onForgotLoginIDStatus",  "getSecretAnswer",  "onSelectSecretQuestionAnswer",  "onDeviceAuthManagementStatus",  "onAccessTokenRefreshed",  "onUserEnrollmentResponse",  "getUserConsentForLDA",  "onAuthenticateUserAndSignData")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("initialize") { value: String ->


       unikenHandler = UnikenHandler(appContext);
      var  unikenCallback = object : UnikenResponseCallback() {
        override fun onStringResponse(methodName: String?, response: String?) {
          super.onStringResponse(methodName, response)
          Log.d(TAG, "$methodName: $response")
          val bundle = Bundle()
          bundle.putString("response",response)
          // bundle.putString("methodName",methodName)
          if (methodName != null) {
            //sendEvent("callBackResponseHandle", bundle)
            sendEvent(methodName, bundle);
          }
        }

        override fun onIntResponse(methodName: String?, respons: String?) {
          super.onIntResponse(methodName, respons)
        }

      };

      var rdnaStatus = unikenHandler.getValue(value, unikenCallback)

      Thread {
        sendEvent("RDNAInitialise", mapOf(
                "value" to rdnaStatus
        ))
      }.start()
      Log.d(TAG, "initializeRDNA: 2")
    }

    AsyncFunction("setUser") { value: String ->
      unikenHandler.setUser(value)
    }

    AsyncFunction("setAccessCode") { value: String ->
      unikenHandler.setAccessCode(value)
    }

    AsyncFunction("resendAccessCode") { value: String ->
      unikenHandler.resendAccessCode()
    }

    AsyncFunction("setUserConsentForLDA") { value: String ->
      unikenHandler.setUserConsentForLDA(value)
    }

    AsyncFunction("setPassword") { value: String ->
      unikenHandler.setPassword(value)
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf(
              "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ExpoModuleUnikenView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: ExpoModuleUnikenView, prop: String ->
        println(prop)
      }
    }

  }

}
