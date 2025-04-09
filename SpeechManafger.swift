
import Foundation
import Speech


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
