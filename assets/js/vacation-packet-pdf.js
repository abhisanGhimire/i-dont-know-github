/**
 * Builds a two-page PDF matching the SET School vacation packet layout (printable / email attachment).
 * Depends on window.jspdf (UMD: window.jspdf.jsPDF).
 */
(function (global) {
  'use strict';

  var SCHOOL_HEADER =
    '100 Waverly St. Suite 103, Ashland, MA 01721   (508) 231-4500';

  var SCHOOL_CONTACT_EMAIL = 'setschoolmw@gmail.com';

  var POLICY_TEXT = [
    'SET School Policies',
    'The school programs are for students in grade 1 through 8.',
    'The school is not responsible for incorrect student information. For effective communication, please ensure that correct phone numbers and email addresses are provided on the application. Please notify us immediately of any changes.',
    'All school announcements and communication will be made through email.',
    'Weather cancellations will also be posted on our website. Please consider the safety of the roads when deciding to come in.',
    'Eating and drinking is not allowed in class; students should bring a snack and a drink for recess or after class.',
    'Parents must notify the school of any medical conditions including allergies.',
    'At SET School we value the principles of kindness, equal opportunity and cultural diversity. In the spirit of maintaining a safe and welcoming environment, we do not tolerate physical, verbal or emotional bullying, violent or destructive behavior, or inappropriate language.',
    'All students are expected to behave in a responsible and appropriate manner both to themselves and to others, showing consideration, courtesy and respect for other people and creatures at all times.',
    'Students must show care and respect to all materials and equipment at the facility.',
    'Students will not use the school computers for any purpose other than class work. Responsible usage of the Internet is expected at all times.',
    'Students cannot leave the building without their parent/legal guardian or any other authorized person.',
  ];

  function val(d, key) {
    var v = d[key];
    return v != null && String(v).trim() !== '' ? String(v).trim() : 'n/a';
  }

  function lines(doc, text, x, y, maxW, lineHeight) {
    var parts = doc.splitTextToSize(text, maxW);
    doc.text(parts, x, y);
    return y + parts.length * lineHeight;
  }

  function buildVacationPacketPdf(data) {
    var jsPDF = global.jspdf && global.jspdf.jsPDF;
    if (!jsPDF) {
      throw new Error('jsPDF not loaded');
    }
    var doc = new jsPDF({ unit: 'mm', format: 'a4' });
    var pageW = doc.internal.pageSize.getWidth();
    var margin = 14;
    var maxW = pageW - margin * 2;
    var y = margin;
    var lh = 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(SCHOOL_HEADER, margin, y);
    y += 8;

    doc.setFontSize(14);
    doc.text('Vacation Application', margin, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Student Information', margin, y);
    y += lh + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    y = lines(
      doc,
      'Name: ' + val(data, 'student_first') + ' ' + val(data, 'student_last') +
        '    Date of birth: ' + val(data, 'student_dob') +
        '    Gender: ' + val(data, 'student_gender'),
      margin,
      y,
      maxW,
      lh
    );
    y += 2;
    y = lines(doc, 'Address: ' + val(data, 'student_address'), margin, y, maxW, lh);
    y = lines(
      doc,
      'City: ' + val(data, 'student_city') + '    State: ' + val(data, 'student_state') + '    ZIP: ' + val(data, 'student_zip'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Grade entering in fall: ' + val(data, 'grade_fall') +
        '    Name of current school: ' + val(data, 'current_school'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(doc, 'Home phone: ' + val(data, 'student_home_phone'), margin, y, maxW, lh);
    y = lines(doc, 'Siblings (age): ' + val(data, 'siblings_ages'), margin, y, maxW, lh);
    y = lines(
      doc,
      'Current student? ' + val(data, 'current_student') +
        '    If no, referral: ' + val(data, 'referral_name'),
      margin,
      y,
      maxW,
      lh
    );
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.text('Parent(s) / Guardian(s)', margin, y);
    y += lh + 2;
    doc.setFont('helvetica', 'normal');

    y = lines(
      doc,
      'Parent/Guardian #1. Home: ' + val(data, 'p1_home_phone') + '    Mobile: ' + val(data, 'p1_mobile'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Address: ' + val(data, 'p1_address') + ', ' + val(data, 'p1_city') + ', ' + val(data, 'p1_state') + ' ' + val(data, 'p1_zip'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Occupation: ' + val(data, 'p1_occupation') + '    Email: ' + val(data, 'p1_email') + '    Relationship: ' + val(data, 'p1_relationship'),
      margin,
      y,
      maxW,
      lh
    );
    y += 3;
    y = lines(
      doc,
      'Parent/Guardian #2. Home: ' + val(data, 'p2_home_phone') + '    Mobile: ' + val(data, 'p2_mobile'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Address: ' + val(data, 'p2_address') + ', ' + val(data, 'p2_city') + ', ' + val(data, 'p2_state') + ' ' + val(data, 'p2_zip'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Occupation: ' + val(data, 'p2_occupation') + '    Email: ' + val(data, 'p2_email') + '    Relationship: ' + val(data, 'p2_relationship'),
      margin,
      y,
      maxW,
      lh
    );
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.text('Medical Insurance', margin, y);
    y += lh + 2;
    doc.setFont('helvetica', 'normal');
    y = lines(
      doc,
      "Subscriber's name: " + val(data, 'ins_subscriber') + '    Insurance name: ' + val(data, 'ins_name'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      "Subscriber's phone: " + val(data, 'ins_sub_phone') + '    Group number: ' + val(data, 'ins_group'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Primary care: ' + val(data, 'ins_primary_name') + '    Phone: ' + val(data, 'ins_primary_phone'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(doc, 'Allergies / medical conditions: ' + val(data, 'allergies'), margin, y, maxW, lh);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.text('Alternative emergency contacts', margin, y);
    y += lh + 2;
    doc.setFont('helvetica', 'normal');
    y = lines(
      doc,
      'Contact #1. Home: ' + val(data, 'e1_home') + '    Work: ' + val(data, 'e1_work'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(doc, 'Address: ' + val(data, 'e1_address'), margin, y, maxW, lh);
    y += 2;
    y = lines(
      doc,
      'Contact #2. Home: ' + val(data, 'e2_home') + '    Work: ' + val(data, 'e2_work'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(doc, 'Address: ' + val(data, 'e2_address'), margin, y, maxW, lh);
    y += 4;

    y = lines(doc, 'Camp / session dates requested: ' + val(data, 'camp_dates'), margin, y, maxW, lh);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.text('Photography consent', margin, y);
    y += lh + 2;
    doc.setFont('helvetica', 'normal');
    y = lines(
      doc,
      'Parent/guardian (print): ' + val(data, 'photo_parent_name') + '    Child: ' + val(data, 'photo_child_name'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Permission (grant or deny) for photos on website / advertising: ' + val(data, 'photo_consent'),
      margin,
      y,
      maxW,
      lh
    );
    y = lines(
      doc,
      'Signature (typed): ' + val(data, 'photo_signature') + '    Date: ' + val(data, 'photo_date'),
      margin,
      y,
      maxW,
      lh
    );

    doc.addPage();
    y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Photography Consent Form', margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    var consentWord =
      String(val(data, 'photo_consent')).toLowerCase().indexOf('deny') !== -1
        ? 'deny'
        : 'grant';
    var photoBlock =
      'I, ' +
      val(data, 'photo_parent_name') +
      ', as the parent/guardian of ' +
      val(data, 'photo_child_name') +
      ', hereby ' +
      consentWord +
      ' permission to the S.E.T. School of Metrowest to use my child\'s photo on their website and other advertising materials (printed or electronic) for the purpose of illustrating typical educational activities.';
    y = lines(doc, photoBlock, margin, y, maxW, lh);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SET School Policies', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    for (var i = 0; i < POLICY_TEXT.length; i++) {
      y = lines(doc, POLICY_TEXT[i], margin, y, maxW, lh * 0.95);
      y += 1.5;
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
    }
    y += 6;
    y = lines(
      doc,
      'Parent/guardian signature (typed), date; policies: ' +
        val(data, 'policy_signature') +
        '    ' +
        val(data, 'policy_date'),
      margin,
      y,
      maxW,
      lh
    );

    doc.setFontSize(8);
    doc.setTextColor(100);
    var pageH = doc.internal.pageSize.getHeight();
    doc.text('SET School, ' + SCHOOL_CONTACT_EMAIL, margin, pageH - 16);
    doc.text(
      'Submitted electronically from setschool website, ' + new Date().toISOString().slice(0, 10),
      margin,
      pageH - 10
    );
    doc.setTextColor(0);

    return doc.output('blob');
  }

  function buildPlainTextSummary(data) {
    var order = [
      'student_first',
      'student_last',
      'student_dob',
      'student_gender',
      'student_address',
      'student_city',
      'student_state',
      'student_zip',
      'grade_fall',
      'current_school',
      'student_home_phone',
      'siblings_ages',
      'current_student',
      'referral_name',
      'p1_home_phone',
      'p1_mobile',
      'p1_address',
      'p1_city',
      'p1_state',
      'p1_zip',
      'p1_occupation',
      'p1_email',
      'p1_relationship',
      'p2_home_phone',
      'p2_mobile',
      'p2_address',
      'p2_city',
      'p2_state',
      'p2_zip',
      'p2_occupation',
      'p2_email',
      'p2_relationship',
      'ins_subscriber',
      'ins_name',
      'ins_sub_phone',
      'ins_group',
      'ins_primary_name',
      'ins_primary_phone',
      'allergies',
      'e1_home',
      'e1_work',
      'e1_address',
      'e2_home',
      'e2_work',
      'e2_address',
      'camp_dates',
      'photo_parent_name',
      'photo_child_name',
      'photo_consent',
      'photo_signature',
      'photo_date',
      'policy_signature',
      'policy_date',
    ];
    var lines = [];
    lines.push('SET SCHOOL VACATION APPLICATION (plain text copy)');
    lines.push('School contact: ' + SCHOOL_CONTACT_EMAIL);
    lines.push('');
    order.forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(data, k) && data[k] !== '') {
        lines.push(k.replace(/_/g, ' ') + ': ' + data[k]);
      }
    });
    return lines.join('\n');
  }

  global.SETSchoolVacationPdf = {
    buildVacationPacketPdf: buildVacationPacketPdf,
    buildPlainTextSummary: buildPlainTextSummary,
  };
})(typeof window !== 'undefined' ? window : this);
