package com.notesify

import android.os.Bundle
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
    window.statusBarColor = android.graphics.Color.TRANSPARENT
  }
}
