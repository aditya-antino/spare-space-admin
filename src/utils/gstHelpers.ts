export const formatGSTForDisplay = (
    state: string | undefined,
    cgst: number,
    sgst: number
) => {
    // Normalize state name for comparison
    const normalizedState = state?.trim().toLowerCase();

    // Check for Delhi (ignoring case)
    if (normalizedState === 'delhi' || normalizedState === 'new delhi') {
        return [
            { label: 'CGST', amount: cgst },
            { label: 'SGST', amount: sgst },
        ];
    }

    // For all other states (or undefined), show IGST
    return [
        { label: 'IGST', amount: cgst + sgst },
    ];
};
