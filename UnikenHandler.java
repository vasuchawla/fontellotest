package expo.modules.moduleuniken;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.uniken.rdna.RDNA;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import expo.modules.kotlin.AppContext;

public class UnikenHandler {

	AppContext context;
	private String TAG = "UNIKEN";
	private RDNA rdnaObj = RDNA.getInstance();
	private RDNA.RDNACallbacks callbacks = null;
	private boolean actionExitTaken = false;

	public UnikenHandler(AppContext ctx){
		context = ctx;

	}




	public String getValue(String value, UnikenResponseCallback unikenResponseCallback) {
		// Send an event to JavaScript.

		callbacks = new RDNA.RDNACallbacks() {
			@Override
			public Context getDeviceContext() {
				return context.getReactContext();
			}

			@Override
			public RDNA.RDNASecurityServiceConfiguration getSecurityServiceConfiguration() {
				return null;
			}

			@Override
			public String getDeviceToken() {
				return "";
			}

			@Override
			public int onGetNotifications(String s) {
				return 0;
			}

			@Override
			public int onUpdateNotification(String s) {
				return 0;
			}

			@Override
			public int onTerminate(String s) {
				return 0;
			}

			@Override
			public int onPauseRuntime(String s) {
				return 0;
			}

			@Override
			public int onResumeRuntime(String s) {
				return 0;
			}

			@Override
			public int onConfigReceived(String s) {
				return 0;
			}

			@Override
			public int onGetAllChallengeStatus(String s) {
				return 0;
			}

			@Override
			public int onGetPostLoginChallenges(String s) {
				return 0;
			}

			@Override
			public int onLogOff(String s) {
				return 0;
			}

			@Override
			public RDNA.RDNAIWACreds getCredentials(String s) {
				return null;
			}

			@Override
			public int onGetRegistredDeviceDetails(String s) {
				return 0;
			}

			@Override
			public int onUpdateDeviceDetails(String s) {
				return 0;
			}

			@Override
			public int onGetNotificationsHistory(String s) {
				return 0;
			}

			@Override
			public int onSessionTimeout(String s) {
				return 0;
			}

			@Override
			public int onSdkLogPrintRequest(RDNA.RDNALoggingLevel rdnaLoggingLevel, String s) {
				return 0;
			}

			@Override
			public boolean permissionRequired(String s) {
				return false;
			}

			@Override
			public void onInitializeError(String s) {
				unikenResponseCallback.onStringResponse("onInitializeError",s);
			}

			@Override
			public void onInitializeProgress(String s) {
				unikenResponseCallback.onStringResponse("onInitializeProgress",s);
			}

			@Override
			public void getUser(String s) {
				unikenResponseCallback.onStringResponse("getUser",s);
			}

			@Override
			public void getActivationCode(String s) {
				unikenResponseCallback.onStringResponse("getActivationCode",s);
			}

			@Override
			public void getPassword(String s) {
				unikenResponseCallback.onStringResponse("getPassword",s);
			}

			@Override
			public void getDeviceName(String s) {
				unikenResponseCallback.onStringResponse("getDeviceName",s);
			}

			@Override
			public void getAccessCode(String s) {
				unikenResponseCallback.onStringResponse("getAccessCode",s);
			}

			@Override
			public void addNewDeviceOptions(String s) {
				unikenResponseCallback.onStringResponse("addNewDeviceOptions",s);
			}

			@Override
			public void onUserLoggedIn(String s) {
				unikenResponseCallback.onStringResponse("onUserLoggedIn",s);
			}

			@Override
			public void onTOTPRegistrationStatus(String s) {
				unikenResponseCallback.onStringResponse("onTOTPRegistrationStatus",s);
			}

			@Override
			public void onTOTPGenerated(String s) {
				unikenResponseCallback.onStringResponse("onTOTPGenerated",s);
			}

			@Override
			public void getTOTPPassword(String s) {
				unikenResponseCallback.onStringResponse("getTOTPPassword",s);
			}

			@Override
			public void hideLoader() {

			}

			@Override
			public void showLoader() {

			}

			@Override
			public void activateUserOptions(String s) {
				unikenResponseCallback.onStringResponse("activateUserOptions",s);
			}

			@Override
			public void onUserLoggedOff(String s) {
				unikenResponseCallback.onStringResponse("onUserLoggedOff",s);
			}

			@Override
			public void onInitialized(String s) {
				unikenResponseCallback.onStringResponse("onInitialized",s);
			}

			@Override
			public void onLoginIdUpdateStatus(String s) {
				unikenResponseCallback.onStringResponse("onLoginIdUpdateStatus",s);
			}

			@Override
			public void getLoginId() {

			}

			@Override
			public void onCredentialsAvailableForUpdate(String s) {
				unikenResponseCallback.onStringResponse("onCredentialsAvailableForUpdate",s);
			}

			@Override
			public void onUpdateCredentialResponse(String s) {
				unikenResponseCallback.onStringResponse("onUpdateCredentialResponse",s);
			}

			@Override
			public void onHandleCustomChallenge(String s) {
				unikenResponseCallback.onStringResponse("onHandleCustomChallenge",s);
			}

			@Override
			public void onForgotLoginIDStatus(String s) {
				unikenResponseCallback.onStringResponse("onForgotLoginIDStatus",s);
			}

			@Override
			public void onUserConsentThreats(String s) {
				unikenResponseCallback.onStringResponse("onUserConsentThreats",s);
			}

			@Override
			public void onTerminateWithThreats(String s) {
				Log.d("Uniken", "Uniken terminateWithThreats: " + s);
				if(actionExitTaken){
					actionExitTaken = false;
					ExitFromApp(context.getReactContext());
				} else {
					String message = s;
					String title = "Caution";
					try {
						JSONArray jsonObject = new JSONArray(s);
						if (jsonObject != null && jsonObject.length() > 0) {
							StringBuilder builder = new StringBuilder();
							for (int i = 0; i < jsonObject.length(); i++) {
								JSONObject threatObject = jsonObject.getJSONObject(i);
								builder.append(threatObject.optString("threatMsg"));
								builder.append("\n");
							}
							message = builder.toString();
						}
					} catch (JSONException exception) {
						exception.printStackTrace();
					}
					String finalMessage = message;
					String finalTitle = title;
					context.getCurrentActivity().runOnUiThread(new Runnable() {
						@Override
						public void run() {
							new androidx.appcompat.app.AlertDialog.Builder(context.getCurrentActivity())
									.setTitle(finalTitle)
									.setMessage(finalMessage)
									.setPositiveButton("Exit", (dialog, which) -> {
										ExitFromApp(context.getReactContext());
									})
									.setCancelable(false)
									.show();
						}
					});
				}
			}

			@Override

			public Activity getCurrentActivity() {
				return context.getCurrentActivity();
			}

			@Override
			public void getSecretAnswer(String s) {
				unikenResponseCallback.onStringResponse("getSecretAnswer",s);
			}

			@Override
			public void onSelectSecretQuestionAnswer(String s) {
				unikenResponseCallback.onStringResponse("onSelectSecretQuestionAnswer",s);
			}

			@Override
			public void onDeviceAuthManagementStatus(String s) {
				unikenResponseCallback.onStringResponse("onDeviceAuthManagementStatus",s);
			}

			@Override
			public void onAccessTokenRefreshed(String s) {
				unikenResponseCallback.onStringResponse("onAccessTokenRefreshed",s);
			}

			@Override
			public void onUserEnrollmentResponse(String s) {
				unikenResponseCallback.onStringResponse("onUserEnrollmentResponse",s);
			}

			@Override
			public void getUserConsentForLDA(String s) {
				unikenResponseCallback.onStringResponse("getUserConsentForLDA",s);
			}

			@Override
			public void onAuthenticateUserAndSignData(String s) {
				unikenResponseCallback.onStringResponse("onAuthenticateUserAndSignData",s);
			}
		};
		String rdnaStatus = "";
		try {
			JSONObject jsonObject = new JSONObject(value);
			rdnaStatus = rdnaObj.Initialize(jsonObject.getString("AGENT_INFO"),
					callbacks,
					jsonObject.getString("UNIKEN_HOST"),
					jsonObject.optInt("UNIKEN_PORT"),
					jsonObject.getString("UNIKEN_ENCRYPTION_TYPE"),
					jsonObject.getString("UNIKEN_SALT"),
					null,
					null,
					null,
					RDNA.RDNALoggingLevel.values()[jsonObject.optInt("LOG_LEVEL")],
					null);
			Log.d(TAG, "initializeRDNA Status:"+rdnaStatus);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return rdnaStatus;
	}

	public void setUser(String value){
		Log.d(TAG, "in handler calling setUser:"+value);
		rdnaObj.setUser(value);
	}

	public void setAccessCode(String value){
		Log.d(TAG, "in handler calling setAccessCode:"+value);
		rdnaObj.setAccessCode(value);
	}

	public void resendAccessCode( ){
		Log.d(TAG, "in handler calling resendAccessCode");
		rdnaObj.resendAccessCode( );
	}

	public void setUserConsentForLDA(String value) {
		Log.d(TAG, "in handler calling setUserConsentForLDA:"+value);
		JSONObject json = null;
		try {
			json = new JSONObject(value);
			boolean shouldEnrollLDA = json.getBoolean("shouldEnrollLDA");
			int challengeMode = json.getInt("challengeMode");
			int authenticationTypes = json.getInt("authenticationType");
			rdnaObj.setUserConsentForLDA(shouldEnrollLDA,challengeMode,authenticationTypes );
		} catch (JSONException e) {
			throw new RuntimeException(e);
		}


	}


	public void setPassword(String value) {
		Log.d(TAG, "in handler calling setPassword:"+value);
		JSONObject json = null;
		try {
			json = new JSONObject(value);
			String mPinVal = json.getString("mPinVal");
			int challengeMode = json.getInt("challengeMode");

			rdnaObj.setPassword(mPinVal, challengeMode );
		} catch (JSONException e) {
			throw new RuntimeException(e);
		}

     
	}



	// not required as the sdk function accepts an int not a enul value. in ios it accepts enum value
	// this might be true or false based on sdk version.

	//	public RDNA.RDNAChallengeOpMode inputChallengeMode(int inChallengeModes) {
	//		RDNA.RDNAChallengeOpMode challengeModes;
	//
	//		switch (inChallengeModes) {
	//			case 0:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_CHALLENGE_OP_VERIFY;
	//				break;
	//			case 1:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_CHALLENGE_OP_SET;
	//				break;
	//			case 2:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_OP_UPDATE_CREDENTIALS;
	//				break;
	//			case 3:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_OP_AUTHORIZE_NOTIFICATION;
	//				break;
	//			case 4:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_OP_UPDATE_ON_EXPIRY;
	//				break;
	//			case 5:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.AUTHORIZE_LDA_MANAGEMENT;
	//				break;
	//			case 6:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.IDV_BIO_OPT_IN;
	//				break;
	//			case 7:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.IDV_BIO_OPT_OUT;
	//				break;
	//			case 8:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.IDV_CHALLENGE_BIOMETRIC_AND_DOCUMENT_SCAN;
	//				break;
	//			case 9:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.IDV_CHALLENGE_BIOMETRIC_AND_DOCUMENT_SCAN;
	//				break;
	//			case 10:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.IDV_API_AGENT_BIOMETRIC_AND_DOCUMENT_SCAN;
	//				break;
	//			case 11:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.IDV_API_DOCUMENT_SCAN;
	//				break;
	//			case 12:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.OP_STEP_UP_AUTH_AND_SIGN_DATA;
	//				break;
	//			case 13:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.OP_STEP_UP_AUTH;
	//				break;
	//			case 14:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.OP_MODE_NONE;
	//				break;
	//			default:
	//				challengeModes = RDNA.RDNAChallengeOpMode.RDNA_.OP_MODE_NONE;
	//				break;
	//		}
	//
	//		return challengeModes;
	//	}
	// not required as the sdk function accepts an int not a enul value. in ios it accepts enum value
	// this might be true or false based on sdk version.

	//	public RDNALDACapabilities inputAuthType(int inputAuthType) {
	//		RDNALDACapabilities authenticationTypes;
	//
	//		switch (inputAuthType) {
	//			case 0:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_INVALID;
	//				break;
	//			case 1:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_FINGERPRINT;
	//				break;
	//			case 2:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_FACE;
	//				break;
	//			case 3:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_PATTERN;
	//				break;
	//			case 4:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_SSKB_PASSWORD;
	//				break;
	//			case 5:
	//				authenticationTypes = RDNALDACapabilities.RDNA_SEC_QA;
	//				break;
	//			case 6:
	//				authenticationTypes = RDNALDACapabilities.RDNA_IDV_EXT_BIO_OPT_IN;
	//				break;
	//			case 7:
	//				authenticationTypes = RDNALDACapabilities.RDNA_IDV_EXT_BIO_OPT_OUT;
	//				break;
	//			case 8:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_DEVICE_PASSCODE;
	//				break;
	//			case 9:
	//				authenticationTypes = RDNALDACapabilities.RDNA_DEVICE_LDA;
	//				break;
	//			case 10:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_BIOMETRIC;
	//				break;
	//			default:
	//				authenticationTypes = RDNALDACapabilities.RDNA_LDA_INVALID;
	//				break;
	//		}
	//
	//		return authenticationTypes;
	//	}
	

	public  void ExitFromApp(Context context) {
		((Activity)(context)).finish();
	}
}
