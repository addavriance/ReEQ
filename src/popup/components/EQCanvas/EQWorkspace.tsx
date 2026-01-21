import {EQCanvas} from './EQCanvas';
import {GainScale} from './GainScale';
import {GainLine} from './GainLine';

/**
 * EQ Workspace component
 * Combines all canvas elements: scales, curves, dots, and visualizer
 */
export function EQWorkspace() {
    return (
        <>
            {/* Gain scale and line */}
            <div className="ears__eq-gain-container">
                <GainScale/>
                <GainLine/>
            </div>

            {/* Main EQ canvas */}
            <div className="ears__eq-main-container">
                <EQCanvas/>
            </div>
        </>
    );
}
