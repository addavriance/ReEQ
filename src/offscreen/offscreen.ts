import {AudioEngine} from './audioEngine/AudioEngine';
import {Filter} from '@/types/filter.types';

/**
 * Global audio engine instance
 */
const audioEngine = new AudioEngine();

/**
 * Message handler for offscreen document
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    (async () => {
        try {
            switch (message.type) {
                case 'captureStream':
                    try {
                        // Capture tab audio stream
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                // @ts-ignore - Chrome specific properties
                                mandatory: {
                                    chromeMediaSource: 'tab',
                                    chromeMediaSourceId: message.streamId,
                                },
                            },
                            video: false,
                        });

                        await audioEngine.setupAudio(
                            stream,
                            message.filters as Filter[],
                            message.gain as number
                        );

                        sendResponse({success: true});
                    } catch (err) {
                        console.error('Capture failed:', err);
                        sendResponse({error: (err as Error).message});
                    }
                    break;

                case 'updateFilter':
                    audioEngine.updateFilter(message.index, {
                        frequency: message.frequency,
                        gain: message.gain,
                        q: message.q,
                    });
                    sendResponse({success: true});
                    break;

                case 'updateGain':
                    audioEngine.updateGain(message.gain);
                    sendResponse({success: true});
                    break;

                case 'resetAllFilters':
                    audioEngine.resetAllFilters();
                    sendResponse({success: true});
                    break;

                case 'resetFilter':
                    audioEngine.resetFilter(message.index);
                    sendResponse({success: true});
                    break;

                case 'applyAllFilters':
                    audioEngine.applyAllFilters(message.filters as Filter[]);
                    sendResponse({success: true});
                    break;

                case 'getFFT':
                    const fftData = audioEngine.getFFTData();
                    sendResponse({
                        type: 'fft',
                        fft: Array.from(fftData),
                    });
                    break;

                case 'stopAudio':
                    await audioEngine.stopAudio();
                    sendResponse({success: true});
                    break;

                default:
                    sendResponse({success: true});
            }
        } catch (error) {
            console.error('Offscreen error:', error);
            sendResponse({error: (error as Error).message});
        }
    })();

    // Return true to indicate async response
    return true;
});

console.log('Ears offscreen loaded');
