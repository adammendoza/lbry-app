import React from 'react';
import {Icon} from './common.js';

var requiredFieldWarningStyle = {
  color: '#cc0000',
  transition: 'opacity 400ms ease-in',
};

var FormField = React.createClass({
  _fieldRequiredText: 'This field is required',
  _type: null,
  _element: null,

  propTypes: {
    type: React.PropTypes.string.isRequired,
    hidden: React.PropTypes.bool,
  },
  getInitialState: function() {
    return {
      adviceState: 'hidden',
      adviceText: null,
    }
  },
  componentWillMount: function() {
    if (['text', 'radio', 'checkbox', 'file'].includes(this.props.type)) {
      this._element = 'input';
      this._type = this.props.type;
    } else if (this.props.type == 'text-number') {
      this._element = 'input';
      this._type = 'text';
    } else {
      // Non <input> field, e.g. <select>, <textarea>
      this._element = this.props.type;
    }
  },
  showAdvice: function(text) {
    this.setState({
      adviceState: 'shown',
      adviceText: text,
    });

    setTimeout(() => {
      this.setState({
        adviceState: 'fading',
      });
      setTimeout(() => {
        this.setState({
          adviceState: 'hidden',
        });
      }, 450);
    }, 5000);
  },
  warnRequired: function() {
    this.showAdvice(this._fieldRequiredText);
  },
  focus: function() {
    this.refs.field.focus();
  },
  getValue: function() {
    if (this.props.type == 'checkbox') {
      return this.refs.field.checked;
    } else if (this.props.type == 'file') {
      return this.refs.field.files[0].path;
    } else {
      return this.refs.field.value;
    }
  },
  getSelectedElement: function() {
    return this.refs.field.options[this.refs.field.selectedIndex];
  },
  render: function() {
    // Pass all unhandled props to the field element
    const otherProps = Object.assign({}, this.props);
    delete otherProps.type;
    delete otherProps.hidden;

    return (
      !this.props.hidden
        ? <div className="form-field-container">
            <this._element type={this._type} className="form-field" name={this.props.name} ref="field" placeholder={this.props.placeholder}
              className={'form-field--' + this.props.type + ' ' + (this.props.className || '')}
              {...otherProps}>
              {this.props.children}
            </this._element>
            <FormFieldAdvice field={this.refs.field} state={this.state.adviceState}>{this.state.adviceText}</FormFieldAdvice>
          </div>
        : null
    );
  }
});

var FormFieldAdvice = React.createClass({
  propTypes: {
    state: React.PropTypes.string.isRequired,
  },
  render: function() {
    return (
      this.props.state != 'hidden'
        ? <div className="form-field-advice-container">
            <div className={'form-field-advice' + (this.props.state == 'fading' ? ' form-field-advice--fading' : '')}>
              <Icon icon="icon-caret-up" className="form-field-advice__arrow" />
              <div className="form-field-advice__content-container">
                <span className="form-field-advice__content">
                  {this.props.children}
                </span>
              </div>
            </div>
          </div>
        : null
    );
  }
});

export default FormField;
