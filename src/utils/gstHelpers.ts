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
            { label: 'CGST (9%)', amount: cgst },
            { label: 'SGST (9%)', amount: sgst },
        ];
    }

    // For all other states (or undefined), show IGST
    return [
        { label: 'IGST (18%)', amount: cgst + sgst },
    ];
};
