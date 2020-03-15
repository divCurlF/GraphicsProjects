
/**
 * Sliders to use for adjustments to colour and camera / light position
 */
function setupSliders() {

  light_x = document.getElementById("light-x");
  light_x.oninput = function() {
    lightPosition[0] = this.value / 100.0;
  }

  light_y = document.getElementById("light-y");
  light_y.oninput = function() {
    lightPosition[1] = this.value / 100.0;
  }

  light_z = document.getElementById("light-z");
  light_z.oninput = function() {
    lightPosition[2] = this.value / 100.0;
  }

  lambient_r = document.getElementById("a-light-red");
  lambient_r.oninput = function() {
    lAmbient[0] = this.value / 255.0;
  }
  lambient_g = document.getElementById("a-light-green");
  lambient_g.oninput = function() {
    lAmbient[1] = this.value / 255.0;
  }

  lambient_b = document.getElementById("a-light-blue");
  lambient_b.oninput = function() {
    lAmbient[1] = this.value / 255.0;
  }

  l_diffuse_r = document.getElementById("d-light-red");
  l_diffuse_r.oninput = function() {
    lDiffuse[0] = this.value / 255.0;
  }

  l_diffuse_g = document.getElementById("d-light-green");
  l_diffuse_g.oninput = function() {
    lDiffuse[1] = this.value / 255.0;
  }

  l_diffuse_b = document.getElementById("d-light-blue");
  l_diffuse_b.oninput = function() {
    lDiffuse[2] = this.value / 255.0;
  }

  l_specular_r = document.getElementById("s-light-red");
  l_specular_r.oninput = function() {
    lSpecular[0] = this.value / 255.0;
  }
  l_specular_g = document.getElementById("s-light-green");
  l_specular_g.oninput = function() {
    lSpecular[1] = this.value / 255.0;
  }
  l_specular_b = document.getElementById("s-light-blue");
  l_specular_b.oninput = function() {
    lSpecular[2] = this.value / 255.0;
  }

  shininess_slider = document.getElementById("shininess");
  shininess_slider.oninput = function() {
    shininess = this.value;
  }

  eye_pt_x = document.getElementById("ipx");
  eye_pt_x.oninput = function() {
    eyePt[0] = this.value / 100.0;
  }

  eye_pt_y = document.getElementById("ipy");
  eye_pt_y.oninput = function() {
    eyePt[1] = this.value / 100.0;
  }

  eye_pt_z = document.getElementById("ipz");
  eye_pt_z.oninput = function() {
    eyePt[2] = this.value / 100.0;
  }

  view_dir_x = document.getElementById("vdx");
  view_dir_x.oninput = function() {
    viewDir[0] = this.value / 100.0;
  }

  view_dir_y = document.getElementById("vdy");
  view_dir_y.oninput = function() {
    viewDir[1] = this.value / 100.0;
  }

  view_dir_z = document.getElementById("vdz");
  view_dir_z.oninput = function() {
    viewDir[2] = this.value / 100.0;
  }

  up_x = document.getElementById("udx");
  up_x.oninput = function() {
    up[0] = this.value / 100.0;
  }

  up_y = document.getElementById("udy");
  up_y.oninput = function() {
    up[1] = this.value / 100.0;
  }

  up_z = document.getElementById("udz");
  up_z.oninput = function() {
    up[2] = this.value / 100.0;
  }

  view_rotation = document.getElementById("vr");
  view_rotation.oninput = function() {
    viewRot = this.value;
  }

  
}