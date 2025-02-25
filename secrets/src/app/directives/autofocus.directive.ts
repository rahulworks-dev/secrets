import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: false,
})
export class AutofocusDirective {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => this.el.nativeElement.setFocus(), 300);
  }
}
