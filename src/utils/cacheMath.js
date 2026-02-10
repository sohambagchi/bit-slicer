/**
 * Calculates the number of bits for Offset, Index, and Tag based on cache parameters.
 * 
 * @param {number} cacheSize - Total cache size in bytes.
 * @param {number} blockSize - Block size in bytes (must be power of 2).
 * @param {number} associativity - Set associativity (1 for direct mapped, >1 for n-way, cacheSize/blockSize for fully associative).
 * @param {number} addressWidth - Total address width in bits (default 32).
 * @returns {object} { offsetBits, indexBits, tagBits }
 */
export function calculateBits(cacheSize, blockSize, associativity, addressWidth = 32) {
    // Validate inputs to avoid Log2(0) or negative numbers
    if (cacheSize <= 0 || blockSize <= 0 || associativity <= 0) {
        return { offsetBits: 0, indexBits: 0, tagBits: 0 };
    }

    // Offset bits = log2(Block Size)
    const offsetBits = Math.log2(blockSize);

    // Number of sets = Cache Size / (Block Size * Associativity)
    const numSets = cacheSize / (blockSize * associativity);

    // Index bits = log2(Number of Sets)
    // If fully associative, numSets = 1, indexBits = 0.
    const indexBits = Math.max(0, Math.log2(numSets));

    // Tag bits = Address Width - Index - Offset
    const tagBits = Math.max(0, addressWidth - indexBits - offsetBits);

    return {
        offsetBits: Math.floor(offsetBits),
        indexBits: Math.floor(indexBits),
        tagBits: Math.floor(tagBits)
    };
}

/**
 * Format bytes to human readable string (KB, MB, etc.)
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
