cols = [
    0x0f0e11,
    0x2d2c33,
    0x51545c,
    0x7c8389,
    0xa8b2b6,
    0xeeebe0,
    0xeec99f,
    0xe1a17e,
    0xcc9562,
    0x9a643a,
    0x783a29,
    0x541d29,
    0x782349,
    0xa93e89,
    0xd062c8,
    0xec94ea,
    0x64e7e7,
    0x2fb6c3,
    0x25739d,
    0x214574,
    0x101445,
    0x3c0d3b,
    0x901f3d,
    0xbb3030,
    0xec6a45,
    0xfb9b41,
    0xf0c04c,
    0xfffb76,
    0x97d948,
    0x6fba3b,
    0x229443,
    0x116548
]

i = 0
for col in cols:
    colorToHtml = '#%02x%02x%02x' % (col >> 16, (col >> 8) & 0xff, col & 0xff)
    print("{ \"" + str(i) + "\": \"<div style=\"\"background: " + colorToHtml + ";\"\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>\" },")
    i += 1