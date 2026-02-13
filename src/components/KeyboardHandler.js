export const setupKeyboardShortcuts = (handlers) => {
    const onKeyDown = (e) => {
        // Example: Save shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (handlers.onSave) handlers.onSave();
        }

        // Example: New record shortcut
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (handlers.onNew) handlers.onNew();
        }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
};
