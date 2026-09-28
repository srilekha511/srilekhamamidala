import { createInput } from './input.js'
import { createLoop } from './loop.js'
import { setupCanvas, setViewSize, VIEW_W, VIEW_H } from './renderer.js'
import { clampCamera, followCamera } from './camera.js'
import { createDirector, introPhase } from './director.js'
import { welcomeText, enterFrameText, tileText, STARRY_TEXT } from './copy.js'
import { mulberry32 } from './rng.js'
import { revealOrder, revealCount } from './effects/reveal.js'
import { easeInOut, lerpRect } from './effects/tween.js'
import { applyRipple, rippleFlash, zoomScale } from './effects/ripple.js'
import { foldRect, settleScale, makeDust, dustAt } from './effects/fold.js'
import { fadeAlpha } from './effects/fade.js'
import { generateStarryNight } from './paintings/starryNight.js'
import { createAudio } from './audio.js'
import { drawFrame } from './sprites/frame.js'
import { drawRoom, frameInnerScreenRect } from './draw/room.js'
import { drawAvatar, drawDust, drawSparkle } from './draw/avatar.js'
import { createIntroReveal, drawWelcome, paintFull } from './draw/intro.js'
import { buildRooms, AVATAR_FEET_Y, TILE_Y } from '../scenes/rooms.js'
import { createHallScene } from '../scenes/hallScene.js'
import { spawnFor } from '../scenes/spawn.js'

const screenRect = () => ({ x: 0, y: 0, w: VIEW_W, h: VIEW_H })
const foldTarget = () => ({ x: Math.round(VIEW_W / 2 - 28), y: 66, w: 56, h: 44 })
const BG = '#120e18'

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  return { canvas: c, ctx }
}

export function createGame({ canvas, emitter, data, initialRoom = 'hall', playIntro = false, reducedMotion = false, isTouch = false, soundOn = false }) {
  const ctx = setupCanvas(canvas)
  const input = createInput()
  const detachInput = input.attach(window)
  const audio = createAudio()
  audio.setEnabled(soundOn)
  const rooms = buildRooms(data)
  const director = createDirector({ room: initialRoom, playIntro, reducedMotion })

  const painting = generateStarryNight()
  const paintingCanvas = makeCanvas(painting.width, painting.height)
  paintingCanvas.ctx.putImageData(new ImageData(painting.pixels, painting.width, painting.height), 0, 0)
  const reveal = createIntroReveal(painting, revealOrder(painting.regions, mulberry32(7)))
  const assets = { starry: paintingCanvas.canvas }
  let snap = makeCanvas(VIEW_W, VIEW_H)
  const dust = makeDust(48, mulberry32(11))

  document.fonts?.load('8px "Press Start 2P"').catch(() => {})

  let scene = createHallScene(rooms[initialRoom])
  let camX = clampCamera(scene.avatar.x - VIEW_W / 2, scene.room.width)
  let t = 0
  let paused = false
  let sparkleUntil = 0
  let landedAt = -1
  let stepTimer = 0
  let lastAvatar = null
  let welcomed = false

  function showWelcome() {
    if (welcomed) return
    welcomed = true
    emitter.emit('bubble', { text: welcomeText(isTouch) })
  }

  function enterScene(roomId, fromId) {
    const spawn = spawnFor(fromId, rooms[roomId])
    scene = createHallScene(rooms[roomId], { spawnX: spawn.x, facing: spawn.facing })
    camX = clampCamera(scene.avatar.x - VIEW_W / 2, scene.room.width)
    emitter.emit('card', null)
    emitter.emit('bubble', null)
    emitter.emit('room', roomId)
  }

  function originOf(target) {
    const cx = target.x + target.w / 2 - camX
    return { x: cx, y: target.y !== undefined ? target.y + target.h / 2 : TILE_Y }
  }

  function handleSceneEvents(events) {
    const inHall = scene.room.id === 'hall'
    for (const ev of events) {
      if (ev.type === 'firstMove' && inHall) emitter.emit('bubble', null)
      if (ev.type === 'frame') {
        if (inHall) {
          const f = ev.frame
          emitter.emit('bubble', f ? { text: f.kind === 'starry' ? STARRY_TEXT : enterFrameText(f.label, isTouch) } : null)
        } else {
          emitter.emit('card', ev.frame?.card ?? null)
          if (ev.frame) audio.sfx('card')
        }
      }
      if (ev.type === 'jump') audio.sfx('jump')
      if (ev.type === 'land') landedAt = t
      if (ev.type === 'tile') emitter.emit('bubble', ev.tile ? { text: tileText(ev.tile.label, isTouch) } : null)
      if (ev.type === 'go' && director.request(ev.target, { origin: originOf(ev.origin) })) {
        emitter.emit('bubble', null)
        emitter.emit('card', null)
        audio.sfx('whoosh')
      }
    }
  }

  function handleDirectorEvents(events) {
    for (const ev of events) {
      if (ev.type === 'introDone') {
        reveal.fill()
        sparkleUntil = t + 0.8
        audio.sfx('sparkle')
        emitter.emit('introDone')
        showWelcome()
        emitter.emit('settled')
      }
      if (ev.type === 'transitionDone') emitter.emit('settled')
      if (ev.type === 'roomChanged') {
        enterScene(ev.room, ev.from)
        if (ev.room === 'hall') showWelcome()
      }
    }
  }

  function update(dt) {
    t += dt
    if (!paused) {
      const mode = director.state.mode
      if (mode === 'play') {
        handleSceneEvents(scene.update(dt, input))
        if (scene.avatar.walking) {
          stepTimer += dt
          if (stepTimer > 0.28) {
            stepTimer = 0
            audio.sfx('step')
          }
        }
      }
      if (input.consume('back')) emitter.emit('back')
      handleDirectorEvents(director.tick(dt))
      camX = followCamera(camX, scene.avatar.x, scene.room.width, dt)
      emitAvatar()
    }
    input.endFrame()
  }

  function emitAvatar() {
    const pos = { x: (scene.avatar.x - camX) / VIEW_W, y: (AVATAR_FEET_Y - 28) / VIEW_H }
    if (!lastAvatar || Math.abs(lastAvatar.x - pos.x) > 0.002) {
      lastAvatar = pos
      emitter.emit('avatar', pos)
    }
  }

  function drawWorld(target, { hideAvatar = false } = {}) {
    drawRoom(target, scene.room, camX, t, assets, scene.activeTile?.id ?? null)
    if (!hideAvatar) drawAvatar(target, scene.avatar, camX)
    if (t < sparkleUntil) drawSparkle(target, scene.avatar.x - camX, AVATAR_FEET_Y - 12, t)
    if (landedAt >= 0 && t - landedAt < 0.25) drawDust(target, scene.avatar.x - camX, AVATAR_FEET_Y - 1, (t - landedAt) / 0.25)
  }

  function renderIntro() {
    const { phase, p } = introPhase(director.state.t, reducedMotion)
    const PAINT_FULL = paintFull()
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    if (phase === 'fade') {
      ctx.globalAlpha = p
      ctx.drawImage(assets.starry, PAINT_FULL.x, PAINT_FULL.y, PAINT_FULL.w, PAINT_FULL.h)
      ctx.globalAlpha = 1
      return
    }
    if (phase === 'reveal') {
      if (reveal.step(revealCount(p, reveal.order.length)) > 0 && Math.floor(t * 8) !== Math.floor((t - 1 / 60) * 8)) audio.sfx('pop')
      ctx.drawImage(reveal.canvas, PAINT_FULL.x, PAINT_FULL.y, PAINT_FULL.w, PAINT_FULL.h)
      return
    }
    if (phase === 'welcome' || phase === 'hold') {
      reveal.step(reveal.order.length)
      ctx.drawImage(reveal.canvas, PAINT_FULL.x, PAINT_FULL.y, PAINT_FULL.w, PAINT_FULL.h)
      drawWelcome(ctx, phase === 'welcome' ? p : 1, t)
      return
    }
    // zoom: painting shrinks into the Starry Night frame on the hall wall
    const e = easeInOut(p)
    drawWorld(ctx, { hideAvatar: p < 0.85 })
    ctx.fillStyle = BG
    ctx.globalAlpha = (1 - e) * 0.95
    ctx.fillRect(0, 0, VIEW_W, VIEW_H)
    ctx.globalAlpha = 1
    const starry = scene.room.frames.find((f) => f.kind === 'starry')
    const r = lerpRect(PAINT_FULL, frameInnerScreenRect(starry, camX), e)
    drawFrame(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, e)
    ctx.drawImage(assets.starry, r.x, r.y, r.w, r.h)
    ctx.save()
    ctx.translate(r.x, r.y)
    ctx.scale(r.w / PAINT_FULL.w, r.h / PAINT_FULL.h)
    ctx.translate(-PAINT_FULL.x, -PAINT_FULL.y)
    drawWelcome(ctx, 1 - e, t)
    ctx.restore()
  }

  function renderTransition() {
    const tr = director.state.transition
    const p = director.progress()
    if (tr.kind === 'crossfade') {
      drawWorld(ctx)
      ctx.fillStyle = '#000000'
      ctx.globalAlpha = fadeAlpha(tr.phase, p)
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      ctx.globalAlpha = 1
      return
    }
    if (tr.kind === 'ripple') {
      if (tr.phase === 'out') {
        const o = tr.origin ?? { x: VIEW_W / 2, y: VIEW_H / 2 }
        drawWorld(snap.ctx)
        const s = zoomScale(p)
        ctx.fillStyle = BG
        ctx.fillRect(0, 0, VIEW_W, VIEW_H)
        ctx.drawImage(snap.canvas, o.x - o.x * s, o.y - o.y * s, VIEW_W * s, VIEW_H * s)
        const src = ctx.getImageData(0, 0, VIEW_W, VIEW_H)
        const dst = ctx.createImageData(VIEW_W, VIEW_H)
        applyRipple(src.data, dst.data, VIEW_W, VIEW_H, o.x, o.y, p)
        ctx.putImageData(dst, 0, 0)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = rippleFlash(p)
        ctx.fillRect(0, 0, VIEW_W, VIEW_H)
        ctx.globalAlpha = 1
      } else {
        drawWorld(ctx)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 1 - p
        ctx.fillRect(0, 0, VIEW_W, VIEW_H)
        ctx.globalAlpha = 1
      }
      return
    }
    // fold: room folds back into its painting, then the hall settles
    if (tr.phase === 'out') {
      drawWorld(snap.ctx)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      const r = foldRect(p, screenRect(), foldTarget())
      drawFrame(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, p)
      ctx.drawImage(snap.canvas, r.x, r.y, r.w, r.h)
      for (const d of dust) {
        const pt = dustAt(d, p, r)
        ctx.globalAlpha = pt.alpha
        ctx.fillStyle = d.color
        ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 1, 1)
      }
      ctx.globalAlpha = 1
    } else {
      drawWorld(snap.ctx)
      const frame = scene.room.frames.find((f) => f.target === tr.from)
      const cx = frame ? frame.x + frame.w / 2 - camX : VIEW_W / 2
      const cy = frame ? frame.y + frame.h / 2 : VIEW_H / 2
      const s = settleScale(p)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, VIEW_W, VIEW_H)
      ctx.drawImage(snap.canvas, cx - cx * s, cy - cy * s, VIEW_W * s, VIEW_H * s)
    }
  }

  function render() {
    const mode = director.state.mode
    if (mode === 'intro') renderIntro()
    else if (mode === 'transition') renderTransition()
    else drawWorld(ctx)
  }

  const loop = createLoop({ update, render })
  loop.start()
  if (!playIntro && initialRoom === 'hall') showWelcome()
  emitter.emit('room', initialRoom)

  return {
    goTo(room, { kind } = {}) {
      const ok = director.request(room, { kind })
      if (ok) {
        emitter.emit('bubble', null)
        emitter.emit('card', null)
      }
      return ok
    },
    press: (a) => input.press(a),
    release: (a) => input.release(a),
    walkToScreen(fx) {
      if (director.state.mode === 'play') scene.walkTo(camX + fx * VIEW_W)
    },
    skipIntro() {
      handleDirectorEvents(director.skipIntro())
    },
    replayIntro() {
      if (!director.replayIntro()) return false
      reveal.reset()
      welcomed = false
      enterScene('hall', null)
      return true
    },
    setPaused(v) {
      paused = !!v
      input.setEnabled(!paused)
    },
    resize(viewW) {
      if (viewW === VIEW_W && canvas.width === viewW) return
      setViewSize(viewW)
      canvas.width = viewW
      ctx.imageSmoothingEnabled = false // resizing a canvas resets its context state
      snap = makeCanvas(VIEW_W, VIEW_H)
      camX = clampCamera(scene.avatar.x - VIEW_W / 2, scene.room.width)
      lastAvatar = null
    },
    setSoundOn(v) {
      audio.setEnabled(v)
    },
    destroy() {
      loop.stop()
      detachInput()
      audio.destroy()
    },
  }
}
