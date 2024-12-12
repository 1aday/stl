export const DEMO_STL = `solid nameplate
# TEMPLATE_COLOR_nameplate_background #FFA500
# TEMPLATE_COLOR_nameplate_frame #333333
# TEMPLATE_TEXT_nameplate_label BADGER
facet normal 0 0 1
    outer loop
      vertex 0   0   0
      vertex 150 0   0
      vertex 150 50  0
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0   0   0
      vertex 150 50  0
      vertex 0   50  0
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0   0   1
      vertex 150 0   1
      vertex 150 50  1
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 0   0   1
      vertex 150 50  1
      vertex 0   50  1
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 50  20  2
      vertex 100 20  2
      vertex 100 30  2
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex 50  20  2
      vertex 100 30  2
      vertex 50  30  2
    endloop
  endfacet
  # Side walls
  facet normal 1 0 0
    outer loop
      vertex 150 0  0
      vertex 150 50 0
      vertex 150 50 1
    endloop
  endfacet
  facet normal 1 0 0
    outer loop
      vertex 150 0  0
      vertex 150 50 1
      vertex 150 0  1
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0  0
      vertex 0 50 1
      vertex 0 50 0
    endloop
  endfacet
  facet normal -1 0 0
    outer loop
      vertex 0 0  0
      vertex 0 0  1
      vertex 0 50 1
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0   50 0
      vertex 150 50 0
      vertex 150 50 1
    endloop
  endfacet
  facet normal 0 1 0
    outer loop
      vertex 0   50 0
      vertex 150 50 1
      vertex 0   50 1
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0   0 0
      vertex 150 0 1
      vertex 150 0 0
    endloop
  endfacet
  facet normal 0 -1 0
    outer loop
      vertex 0   0 0
      vertex 0   0 1
      vertex 150 0 1
    endloop
  endfacet
endsolid`;

export const getDemoSTL = () => {
    return new File([DEMO_STL], 'demo.stl', { type: 'model/stl' });
}; 