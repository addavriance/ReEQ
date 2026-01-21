import {Filter} from '@/types/filter.types';

/**
 * Manages the chain of biquad filters and gain nodes
 */
export class FilterChain {
    private preGainNode: GainNode;
    private postGainNode: GainNode;
    private filters: BiquadFilterNode[];

    constructor(audioContext: AudioContext, filterConfigs: Filter[], gain: number) {

        // Create gain nodes
        this.preGainNode = audioContext.createGain();
        this.preGainNode.gain.value = 1;

        this.postGainNode = audioContext.createGain();
        this.postGainNode.gain.value = gain;

        // Create biquad filters
        this.filters = filterConfigs.map((config) => {
            const filter = audioContext.createBiquadFilter();
            filter.type = config.type;
            filter.frequency.value = config.frequency;
            filter.gain.value = config.gain;
            filter.Q.value = config.q;
            return filter;
        });

        // Initial connection
        this.connectFilterChain();
    }

    /**
     * Connect filter chain, skipping filters with 0 gain
     * Ported from offscreen.js
     */
    private connectFilterChain(): void {
        if (!this.preGainNode || !this.postGainNode) return;

        // Disconnect all nodes
        this.preGainNode.disconnect();
        this.filters.forEach((f) => f.disconnect());

        // Connect chain, skipping filters with 0 gain
        let prev: AudioNode = this.preGainNode;
        for (let i = 0; i < this.filters.length; i++) {
            // Skip filters with gain === 0 for performance
            if (this.filters[i].gain.value !== 0) {
                prev.connect(this.filters[i]);
                prev = this.filters[i];
            }
        }

        // Connect to output
        prev.connect(this.postGainNode);
    }

    /**
     * Update a specific filter
     */
    updateFilter(index: number, filter: Partial<Filter>): void {
        if (!this.filters[index]) return;

        const filterNode = this.filters[index];

        if (filter.frequency !== undefined) {
            filterNode.frequency.value = filter.frequency;
        }
        if (filter.gain !== undefined) {
            filterNode.gain.value = filter.gain;
        }
        if (filter.q !== undefined) {
            filterNode.Q.value = filter.q;
        }
        if (filter.type !== undefined) {
            filterNode.type = filter.type;
        }

        // Reconnect chain after update
        this.connectFilterChain();
    }

    /**
     * Update overall gain
     */
    updateGain(gain: number): void {
        if (this.postGainNode) {
            this.postGainNode.gain.value = gain;
        }
    }

    /**
     * Reset all filters to 0 gain
     */
    resetAllFilters(): void {
        this.filters.forEach((filter) => {
            filter.gain.value = 0;
        });
        this.connectFilterChain();
    }

    /**
     * Reset a specific filter to 0 gain
     */
    resetFilter(index: number): void {
        if (!this.filters[index]) return;
        this.filters[index].gain.value = 0;
        this.connectFilterChain();
    }

    /**
     * Apply multiple filter updates at once
     */
    applyAllFilters(filterConfigs: Filter[]): void {
        filterConfigs.forEach((config, i) => {
            if (this.filters[i]) {
                this.filters[i].frequency.value = config.frequency;
                this.filters[i].gain.value = config.gain;
                this.filters[i].Q.value = config.q;
            }
        });
        this.connectFilterChain();
    }

    /**
     * Get the input node for connecting source
     */
    getInputNode(): AudioNode {
        return this.preGainNode;
    }

    /**
     * Get the output node for connecting destination
     */
    getOutputNode(): AudioNode {
        return this.postGainNode;
    }

    /**
     * Get all filter nodes
     */
    getFilters(): BiquadFilterNode[] {
        return this.filters;
    }
}
