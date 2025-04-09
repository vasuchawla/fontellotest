struct ComponentListView: View {
    let components: [Component]
    @State private var searchText = ""
    @StateObject private var speechManager = SpeechManager()


    

    var body: some View {
        NavigationView {
            
            VStack {
                HStack {
                    TextField("Search...", text: $searchText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button(action: {
                        if speechManager.isRecording {
                            speechManager.stopRecording()
                        } else {
                            speechManager.startRecording()
                        }
                    }) {
                        Image(systemName: speechManager.isRecording ? "mic.fill" : "mic")
                    }
                }
                .padding()
                
                
                List(filteredComponents, id: \.name) { component in
                    NavigationLink(destination: ComponentDetailView(component: component)) {
                        Text(component.name.rawValue)
                    }
                }
                .navigationTitle("Components")
                .onChange(of: speechManager.transcript) { newValue in
                                searchText = newValue
                            }
            }
        }
    }
    
    var filteredComponents : [Component] {
        if(searchText.isEmpty){
            return components
        }
        else{
            return components.filter{
                $0.name.rawValue.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
}
