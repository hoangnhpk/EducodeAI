import { useState, type InputHTMLAttributes } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string;
  label: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  floating?: boolean;
};

const PasswordInput = ({
  id,
  label,
  error,
  containerClassName = '',
  inputClassName = '',
  floating = false,
  className,
  'aria-describedby': ariaDescribedBy,
  ...inputProps
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;
  const describedBy = [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <div className={containerClassName}>
      <div className={floating ? 'form-floating position-relative' : 'position-relative'}>
        {!floating && <label htmlFor={id}>{label}</label>}
        {floating ? (
          <>
            <input
              {...inputProps}
              id={id}
              type={isVisible ? 'text' : 'password'}
              placeholder=" "
              className={`${className ?? inputClassName} pe-5`.trim()}
              aria-invalid={error ? true : inputProps['aria-invalid']}
              aria-describedby={describedBy}
            />
            <label htmlFor={id}>{label}</label>
            <button
              type="button"
              className="password-input-toggle position-absolute end-0 top-50 translate-middle-y d-inline-flex align-items-center justify-content-center"
              aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={isVisible}
              onClick={() => setIsVisible((current) => !current)}
            >
              {isVisible ? <FaEyeSlash aria-hidden="true" focusable="false" /> : <FaEye aria-hidden="true" focusable="false" />}
            </button>
          </>
        ) : (
          <div className="password-input-control position-relative">
            <input
              {...inputProps}
              id={id}
              type={isVisible ? 'text' : 'password'}
              className={`${className ?? inputClassName} pe-5`.trim()}
              aria-invalid={error ? true : inputProps['aria-invalid']}
              aria-describedby={describedBy}
            />
            <button
              type="button"
              className="password-input-toggle position-absolute end-0 top-50 translate-middle-y d-inline-flex align-items-center justify-content-center"
              aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={isVisible}
              onClick={() => setIsVisible((current) => !current)}
            >
              {isVisible ? <FaEyeSlash aria-hidden="true" focusable="false" /> : <FaEye aria-hidden="true" focusable="false" />}
            </button>
          </div>
        )}
      </div>
      {error && <div id={errorId} className="invalid-feedback d-block" role="alert">{error}</div>}
    </div>
  );
};

export default PasswordInput;
