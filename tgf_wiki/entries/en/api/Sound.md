Created with `Fx:createSound`, it's used to create sounds effects and for sound playback.

### Functions
|Function|Description|
-----|-----
`Sound:setNotes(string)` | Sets the note list for this sound with a string. Valid characters: `C`, `D`, `E`, `F`, `G`, `A`, `B`. Numbers: `0`, `1`, `2`, `3`, `4`, `5` for the octaves, and `#` for sharp and `-` for flat (must come after the octave number). Or `!`, for silence. E.g.: `C4# C1-! D2`. Whitespaces are ignored.
`Sound:setVolumes(string)` | Sets the volume list for this sound with a string. Valid characters: `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`. E.g.: `77554 33221`.
`Sound:setEffects(string)` | Sets the effect list for this sound with a string. Valid characters: `N` for none, `S` for slide, `V` for vibrato, `F` for fade-out. E.g.: `NNNF`
`Sound:setWaveForms(string)` | Sets the waveform list for this sound with a string. Valid characters: `T` for triangle, `S` for square, `P` for pulse and `N` for noise. E.g.: `TTTSP`.
`Sound:set(notes, waveForms, volumes, effects)` | Sets all of the above in a single function.

### Properties
|Property|Description|
-----|-----
`Sound.speed` | Gets/Sets the speed of the notes in seconds-daley.