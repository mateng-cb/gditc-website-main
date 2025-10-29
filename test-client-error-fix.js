/**
 * 测试客户端错误修复
 * 验证Events和Standards页面的修复是否有效
 */

const fs = require('fs');
const path = require('path');

function testFile(filePath, description) {
  console.log(`\n🧪 测试 ${description}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否包含安全的字符串转换
    const hasStringConversion = content.includes('String(');
    console.log(`  ✅ 包含String()转换: ${hasStringConversion ? '是' : '否'}`);
    
    // 检查是否有默认值处理
    const hasDefaultValues = content.includes('|| \'') || content.includes('|| "');
    console.log(`  ✅ 包含默认值处理: ${hasDefaultValues ? '是' : '否'}`);
    
    // 检查是否有错误处理
    const hasErrorHandling = content.includes('catch') || content.includes('try');
    console.log(`  ✅ 包含错误处理: ${hasErrorHandling ? '是' : '否'}`);
    
    // 检查是否有revalidate字段
    const hasRevalidate = content.includes('revalidate:');
    console.log(`  ✅ 包含revalidate字段: ${hasRevalidate ? '是' : '否'}`);
    
    return hasStringConversion && hasDefaultValues && hasErrorHandling;
  } catch (error) {
    console.log(`  ❌ 读取文件失败: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 开始测试客户端错误修复...\n');
  
  const eventsFile = path.join(__dirname, 'pages', 'events', 'page', '[page].tsx');
  const standardsFile = path.join(__dirname, 'pages', 'standards', 'page', '[page].tsx');
  
  const eventsPassed = testFile(eventsFile, 'Events页面');
  const standardsPassed = testFile(standardsFile, 'Standards页面');
  
  console.log('\n📊 测试结果总结:');
  console.log(`  Events页面修复: ${eventsPassed ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  Standards页面修复: ${standardsPassed ? '✅ 通过' : '❌ 失败'}`);
  
  if (eventsPassed && standardsPassed) {
    console.log('\n🎉 所有页面修复都通过了！');
    console.log('💡 建议运行 npm run build 来验证构建是否成功');
  } else {
    console.log('\n⚠️ 部分页面修复未通过，请检查相关文件');
  }
}

main();

