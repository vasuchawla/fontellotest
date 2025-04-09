struct SplashScreenView: View {
    @State private var isActive = false

    var body: some View {
        if isActive {
            MainAppView() // Your actual app
        } else {
            ZStack {
                Color.white
                    .ignoresSafeArea()

                VStack(spacing: 20) {
                    Image(systemName: "swift") // Replace with your logo
                        .resizable()
                        .frame(width: 100, height: 100)
                    Text("Welcome to MyApp")
                        .font(.headline)
                        .foregroundColor(.gray)
                }
            }
            .onAppear {
                // Delay for 2 seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    withAnimation {
                        isActive = true
                    }
                }
            }
        }
    }
}

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            SplashScreenView()
        }
    }
}




import Foundation
import Speech
<key>NSSpeechRecognitionUsageDescription</key>
<string>We use your voice to help you search components.</string>


class SpeechManager: ObservableObject {
    private let recognizer = SFSpeechRecognizer()
    private let audioEngine = AVAudioEngine()
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?

    @Published var transcript = ""
    @Published var isRecording = false

    func startRecording() {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            guard authStatus == .authorized else { return }
        }

        let node = audioEngine.inputNode
        request = SFSpeechAudioBufferRecognitionRequest()
        guard let request = request else { return }

        request.shouldReportPartialResults = true

        task = recognizer?.recognitionTask(with: request) { result, error in
            if let result = result {
                DispatchQueue.main.async {
                    self.transcript = result.bestTranscription.formattedString
                }
            }
        }

        let format = node.outputFormat(forBus: 0)
        node.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            request.append(buffer)
        }

        audioEngine.prepare()
        try? audioEngine.start()

        DispatchQueue.main.async {
            self.isRecording = true
        }
    }

    func stopRecording() {
        audioEngine.stop()
        request?.endAudio()
        task?.cancel()

        DispatchQueue.main.async {
            self.isRecording = false
        }
    }
}
