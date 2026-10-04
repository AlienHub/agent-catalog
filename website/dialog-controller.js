// Native <dialog> keeps focus trapping, Escape, inertness and focus restoration.
// A monotonically increasing generation prevents stale exit callbacks closing a
// newly reopened dialog. Only the current close can restore focus/change state.
export function createDialogController(dialog, animate, reduced = () => false) {
  let generation = 0, animation, destroyed = false;
  const stop = () => { animation?.stop(); animation = undefined; };
  return {
    async setOpen(open, onClosed = () => {}) {
      const current = ++generation; stop();
      if (destroyed) return;
      if (open && !dialog.open) dialog.showModal();
      if (!open && !dialog.open) return;
      const frames = open ? { opacity: [0, 1], x: [20, 0] } : { opacity: [1, 0], x: [0, 16] };
      if (!reduced()) {
        animation = animate(dialog, frames, { duration: open ? .2 : .16, ease: [.22, 1, .36, 1] });
        await animation;
      }
      if (destroyed || current !== generation) return;
      dialog.style.opacity = ''; dialog.style.transform = '';
      if (!open) { dialog.close(); onClosed(); }
    },
    destroy() { destroyed = true; generation++; stop(); if (dialog.open) dialog.close(); },
  };
}
