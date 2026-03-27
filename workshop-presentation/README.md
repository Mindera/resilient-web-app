# Workshop Presentation

Interactive slide deck for the "Building Resilient Spring Boot Apps with Resilience4j" workshop.

## How to Run

```bash
cd workshop-presentation
npm install
npm start
```

Opens at `http://localhost:3000`

## Controls

- **Arrow keys** or **Spacebar** to navigate slides
- **S** key to open speaker notes view (separate window)
- **F** key for fullscreen
- **Escape** to see overview

## Speaker Notes

Each slide has detailed speaker notes. Press **S** to open the speaker view in a separate window. Notes include:
- Talking points
- Facilitation tips
- Common questions and answers
- Timing guidance

## Building for Production

```bash
npm run build
# Output goes to dist/
```

## Troubleshooting

**Blank screen?**
- Check browser console for errors
- Try clearing localStorage: `localStorage.clear()`

**Code blocks not rendering?**
- The `CodeSpanPane` warnings during build are normal and don't affect functionality
