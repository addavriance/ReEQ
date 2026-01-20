import {AudioEngine} from './audioEngine/AudioEngine';
import {
    isOffscreenMessage,
    assertNever,
    type BackgroundToOffscreenMessage
} from '@/types/messages.types';

/**
 * Map of audio engines per tab
 * Key: tabId, Value: AudioEngine instance
 */
const audioEngines = new Map<number, AudioEngine>();

/**
 * Message handler for offscreen document
 * Only processes messages from Background intended for Offscreen
 */
chrome.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
    // Only handle messages intended for offscreen
    if (!isOffscreenMessage(message.type)) {
        return; // Not for us, ignore
    }

    // Now message.type is typed as BackgroundToOffscreenType
    const typedMessage = message as BackgroundToOffscreenMessage;

    (async () => {
        try {
            switch (typedMessage.type) {
                case 'captureStream':
                    try {
                        const tabId = typedMessage.tabId;

                        // Capture tab audio stream
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                // @ts-ignore - Chrome specific properties
                                mandatory: {
                                    chromeMediaSource: 'tab',
                                    chromeMediaSourceId: typedMessage.streamId,
                                },
                            },
                            video: false,
                        });

                        // Create or get audio engine for this tab
                        let engine = audioEngines.get(tabId);
                        if (!engine) {
                            engine = new AudioEngine();
                            audioEngines.set(tabId, engine);
                        }

                        await engine.setupAudio(
                            stream,
                            typedMessage.filters,
                            typedMessage.gain
                        );

                        console.log(`Audio engine started for tab ${tabId}. Active engines:`, audioEngines.size);
                        sendResponse({success: true});
                    } catch (err) {
                        console.error('Capture failed:', err);
                        sendResponse({error: (err as Error).message});
                    }
                    break;

                case 'updateFilter':
                    // Apply to all active audio engines
                    audioEngines.forEach((engine) => {
                        engine.updateFilter(typedMessage.index, {
                            frequency: typedMessage.frequency,
                            gain: typedMessage.gain,
                            q: typedMessage.q,
                        });
                    });
                    sendResponse({success: true});
                    break;

                case 'updateGain':
                    // Apply to all active audio engines
                    audioEngines.forEach((engine) => {
                        engine.updateGain(typedMessage.gain);
                    });
                    sendResponse({success: true});
                    break;

                case 'resetAllFilters':
                    // Apply to all active audio engines
                    audioEngines.forEach((engine) => {
                        engine.resetAllFilters();
                    });
                    sendResponse({success: true});
                    break;

                case 'resetFilter':
                    // Apply to all active audio engines
                    audioEngines.forEach((engine) => {
                        engine.resetFilter(typedMessage.index);
                    });
                    sendResponse({success: true});
                    break;

                case 'applyAllFilters':
                    // Apply to all active audio engines
                    audioEngines.forEach((engine) => {
                        engine.applyAllFilters(typedMessage.filters);
                    });
                    sendResponse({success: true});
                    break;

                case 'getFFTInternal': {
                    // Get FFT from specific tab's audio engine
                    const tabId = typedMessage.tabId;
                    const engine = audioEngines.get(tabId);

                    if (!engine) {
                        console.warn(`[Offscreen] No audio engine found for tab ${tabId}`);
                        sendResponse({type: 'fft', fft: []});
                        break;
                    }

                    const fftData = engine.getFFTData();
                    sendResponse({
                        type: 'fft',
                        fft: Array.from(fftData),
                    });
                    break;
                }

                case 'stopAudio': {
                    const tabIdToStop = typedMessage.tabId;
                    const engineToStop = audioEngines.get(tabIdToStop);
                    if (engineToStop) {
                        await engineToStop.stopAudio();
                        audioEngines.delete(tabIdToStop);
                        console.log(`Audio engine stopped for tab ${tabIdToStop}. Active engines:`, audioEngines.size);
                    }
                    sendResponse({success: true});
                    break;
                }

                default:
                    // Exhaustive check: if you get an error here, you forgot to handle a message type
                    assertNever(typedMessage);
            }
        } catch (error) {
            console.error('Offscreen error:', error);
            sendResponse({error: (error as Error).message});
        }
    })();

    // Return true to indicate async response
    return true;
});

console.log('ReEQ offscreen loaded');
