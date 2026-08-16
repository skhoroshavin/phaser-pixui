# Frame update

## Layout resolution

Changes that affect layout (width, height, text, adding children) mark the
component tree dirty but don't recalculate geometry immediately. Resolution
runs once per frame at game `prerender`, collapsing potentially multiple
changes into a single layout pass. Since this event fires after all scenes
have updated, no layout property change from any scene is missed.

However, this also means you cannot get resolved geometry right after changing
a layout property. Sometimes you need resolved geometry before rendering.
For example, ScrollArea needs its content height to dynamically chase the scroll
end position. For these cases, subscribe to the scene `prerender` event,
which fires after game `prerender`, when component geometry is already resolved.

## GameObject tracking

GameObjectMount tracks its target at game `poststep`, which fires after all
scenes have updated, guaranteeing no frame lag, regardless of which scene
the tracked object belongs to.

Normally the mount just moves its components without running layout resolution
every frame. Only when the object reappears on screen, or an anchor flip is
needed, full layout resolution is triggered using the standard dirty
mechanism. It also doesn't introduce frame lag, because actual resolution runs
on game `prerender`, which is fired after game `poststep`, when mount layout
parameters are updated.
