import {useEffect} from 'react';
import {EQWorkspace} from './components/EQCanvas/EQWorkspace';
import {PresetControls} from './components/Controls/PresetControls';
import {PresetList} from './components/Controls/PresetList';
import {EQToggleButton} from './components/Controls/EQToggleButton';
import {VisualizerToggle} from './components/Controls/VisualizerToggle';
import {useChromeMessaging, requestWorkspaceRefresh} from './hooks/useChromeMessaging';
import {useTabSync} from './hooks/useTabSync';

function App() {
    useChromeMessaging();

    useTabSync();

    useEffect(() => {
        requestWorkspaceRefresh();
    }, []);

    return (
        <div className="ears">
            <div className="ears__container">
                {/* Header */}
                <header className="ears__header">
                    <h1 className="ears__title">Ears Audio Toolkit</h1>
                    <div className="ears__warning">
                        <em className="ears__warning-text">
                            Warning: Loud audio will damage hearing/speakers! Listen responsibly :)
                        </em>
                    </div>
                </header>

                {/* Main EQ Workspace */}
                <div className="ears__eq">
                    <EQWorkspace/>
                    <VisualizerToggle/>
                </div>

                {/* Preset Controls */}
                <div className="ears__controls">
                    <PresetControls/>
                </div>

                {/* Preset List */}
                <div className="ears__presets">
                    <PresetList/>
                </div>

                {/* EQ Toggle Button */}
                <div className="ears__current-tab">
                    <EQToggleButton/>
                </div>

                {/* Footer */}
                <footer className="ears__footer">
                    <a
                        href="https://github.com/addavriance"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ears__footer-link"
                    >
                        GitHub
                    </a>
                    <a
                        href="mailto:"
                        className="ears__footer-link"
                    >
                        Contact
                    </a>
                </footer>
            </div>
        </div>
    );
}

export default App;
