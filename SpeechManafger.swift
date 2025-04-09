import SwiftUI

public struct SplashScreenView: View {
    @State private var isActive = false

    public init() {}

    public var body: some View {
        ZStack {
            if isActive {
                ComponentListView() // 👈 Your main component screen
            } else {
                VStack(spacing: 20) {
                    Image(systemName: "sparkles")
                        .resizable()
                        .frame(width: 100, height: 100)
                        .foregroundColor(.blue)

                    Text("Playground UI")
                        .font(.title2)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.white)
                .ignoresSafeArea()
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        withAnimation {
                            isActive = true
                        }
                    }
                }
            }
        }
    }
}


struct ContentView: View {
    var body: some View {
        SplashScreenView() // 👈 Start with splash
    }
}





@State private var scale: CGFloat = 0.6

...

.onAppear {
    withAnimation(.easeInOut(duration: 1.0)) {
        scale = 1.0
    }

    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
        withAnimation {
            isActive = true
        }
    }
}

...

Image(systemName: "sparkles")
    .resizable()
    .frame(width: 100, height: 100)
    .scaleEffect(scale)








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
